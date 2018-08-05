const chokidar = require('chokidar');

const { STATIC } = require('./constants');

module.exports = function(site, runTask) {
  let postsWatcher = chokidar.watch(['posts/*md', 'posts/*html'], {
    ignored: /(^|[/\\])\../,
    ignoreInitial: true
  });

  postsWatcher.on('all', async(event, path) => {
    await site.handlePostChange(event, path);
    // Need to further refine this to only rebuild changed files
    runTask([
      'generatePostsFromMarkdown',
      'generatePages',
      'generatePagesForTags'
    ], site);
  });

  let layoutsWatcher = chokidar.watch('layouts/*html', {
    ignored: /(^|[/\\])\../,
    ignoreInitial: true
  });

  layoutsWatcher.on('all', () => {
    // Need to further refine this to only rebuild changed files
    runTask([
      'generatePostsFromMarkdown',
      'generatePages',
      'generatePagesForTags'
    ], site);
  });

  let pagesWatcher = chokidar.watch('pages/*html', {
    ignored: /(^|[/\\])\../,
    ignoreInitial: true
  });

  pagesWatcher.on('all', () => {
    // Need to further refine this to only rebuild changed files
    runTask('generatePages', site);
  });

  let majorAssetsWatcher = chokidar.watch([`${STATIC}/css/**/*css`, `${STATIC}/js/**/*js`], {
    ignored: /(^|[/\\])\../,
    ignoreInitial: true
  });

  majorAssetsWatcher.on('all', async(event, path) => {
    // Need to further refine this to only rebuild changed files
    runTask('copyMajorStaticAssets', site, { event, path });
  });
}
