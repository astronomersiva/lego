// require('time-require');

const chalk = require('chalk');

const Site = require('./site');
const runTask = require('./utils/runTask');
const watch = require('./utils/watch');
const { BUILD } = require('./utils/constants');

module.exports = async function(args) {
  try {
    const [task] = args;

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

    const server = [...build, 'startServer'];

    if (['g', 'generate'].includes(task)) {
      const siteName = args[1];
      if (!siteName) {
        console.log(chalk.red('Please provide a site name. Usage `lego g siteName`.\n'));
        process.exit(1);
      }

      await runTask('generateSite', siteName);
      return;
    }

    if (['s', 'server'].includes(task)) {
      const site = new Site({ development: true });
      await runTask(server, site);
      watch(site, runTask);
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
