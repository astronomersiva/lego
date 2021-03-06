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

    const [task = 'b'] = args;

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

    let server = ['startServer'];
    let skipBuild = process.argv.includes('--skipBuild');
    if (!skipBuild) {
      server.push(...build);
    }

    if (['s', 'server'].includes(task)) {
      const site = new Site({ development: true, skipBuild });
      await site.prepareSite();
      await runTask(server, site);

      if (!skipBuild) {
        watch(site, runTask);
      }
    } else if (['b', 'build'].includes(task)) {
      process.env.NODE_ENV = 'production';

      const site = new Site();
      await site.prepareSite();
      await runTask([
        ...build,
        'revisionAssets',
        'optimiseImages',
        'inlineAssets',
        [
          'extractCritical',
          'generateSiteMap',
          'generateRSSFeeds'
        ]
      ], site);

      let logger = site.getLogger();
      logger.timeEnd(`Build created at ${chalk.cyan(BUILD)}.`);
    } else {
      console.log(
        chalk.cyan(
          `Task ${task} not found. Run \`lego s\` to start a development server and \`lego b\` to start a production build.`
        )
      );
    }
  } catch (error) {
    console.log(chalk.red(`${error.message}\n`));
    process.exit(1);
  }
}
