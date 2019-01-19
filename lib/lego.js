// require('time-require');
require('v8-compile-cache');

const chalk = require('chalk');

const Site = require('./site');
const runTask = require('./utils/runTask');
const watch = require('./utils/watch');
const { BUILD } = require('./utils/constants');

const pkg = require('../package.json');

module.exports = async function(args) {
  try {
    if (process.argv.includes('-v') || process.argv.includes('--version')) {
      console.log(pkg.version);
      process.exit();
    }

    const [task] = args;

    if (['g', 'generate'].includes(task)) {
      const siteName = args[1];
      if (!siteName) {
        console.log(chalk.red('Please provide a site name. Usage `lego g siteName`.\n'));
        process.exit(1);
      }

      await runTask('generateSite', siteName);
      return;
    }

    const build = [
      [
        'copyCNAME',
        'generatePostsFromMarkdown',
        'generatePages',
        'generatePagesForTags',
        'copyMinorStaticAssets',
        'copyMajorStaticAssets'
      ]
    ];

    let server = [];
    let skipBuild = process.argv.includes('--skipBuild');
    if (!skipBuild) {
      server.push(...build);
    }

    server.push('startServer');

    if (['s', 'server'].includes(task)) {
      const site = new Site({ development: true, skipBuild });
      await runTask(server, site);

      if (!skipBuild) {
        watch(site, runTask);
      }
    } else {
      process.env.NODE_ENV = 'production';

      const site = new Site();
      await runTask([
        ...build,
        'revisionAssets',
        [
          'optimiseImages',
          'extractCritical',
          'inlineAssets',
          'generateSiteMap'
        ]
      ], site);

      site.logger.success(`Build created at ${chalk.cyan(BUILD)}.`);
    }
  } catch (error) {
    console.log(chalk.red(`${error.message}\n`));
    process.exit(1);
  }
}
