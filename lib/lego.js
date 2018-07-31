const Site = require('./site');

const runTask = require('./utils/runTask');

module.exports = async function(args) {
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
  try {
    if (['s', 'server'].includes(task)) {
      await runTask(server, site);
    } else {
      await runTask(build, site);
    }
  } catch (error) {
    process.exit(1);
  }
}
