const chalk = require('chalk');

const Site = require('./site');
const runTask = require('./utils/runTask');
const watch = require('./utils/watch');

module.exports = async function(args) {
  try {
    const [task] = args;

    const build = [
      'cleanBuild',
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

    const site = new Site();

    if (['s', 'server'].includes(task)) {
      await runTask(server, site);
      watch(site, runTask);
    } else {
      await runTask([...build, 'revisionAssets'], site);
    }
  } catch (error) {
    console.log(chalk.red(`${error.message}\n`));
    process.exit(1);
  }
}
