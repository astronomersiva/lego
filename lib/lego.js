const Site = require('./site');

const runTask = require('./utils/runTask');

module.exports = async function(args) {
  const site = new Site();

  const [task] = args;
  try {
    if (task) {
      runTask(task, site);
    } else {
      const taskList = [
        'cleanBuild',
        'copyCNAME',
        'generatePages',
        'generatePostsFromMarkdown',
        'generatePagesForTags',
        'copyMinorStaticAssets',
        'copyMajorStaticAssets',
        'startServer'
      ];

      for (const task of taskList) {
        await runTask(task, site);
      }
    }
  } catch (error) {
    process.exit(1);
  }
}
