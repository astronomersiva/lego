module.exports = function(site) {
  const RSS = require('rss');
  const fs = require('fs-extra');
  const { BUILD } = require('../utils/constants');

  try {
    let message = 'Generating RSS Feeds.';
    site.logger.await(message);

    let { rss, url, author } = site.getConfig();
    if (!rss) {
      site.logger.success(message);
      return;
    }

    let tags = [...new Set(site.getTags())];
    let posts = site.getPosts();

    let options = Object.assign({
      categories: tags,
      pubDate: new Date()
    }, rss);

    let feed = new RSS(options);

    for (let post of posts) {
      feed.item({
        title: post.title,
        description: post.description,
        url: `${url}${post.path}`,
        categories: post.tags,
        author: post.author || author,
        date: post.date
      });
    }

    fs.writeFileSync(`${BUILD}/rss.xml`, feed.xml({ indent: true }));

    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
