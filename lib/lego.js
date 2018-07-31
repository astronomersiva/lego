const chalk = require('chalk');

const Site = require('./site');
const runTask = require('./utils/runTask');

module.exports = async function(args) {
  try {
    const site = new Site();

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

    const [task] = args;
    if (['s', 'server'].includes(task)) {
      await runTask(server, site);
    } else {
      await runTask(build, site);
    }
  } catch (error) {
    console.log(chalk.red(`${error.message}\n`));
    process.exit(1);
  }
}
