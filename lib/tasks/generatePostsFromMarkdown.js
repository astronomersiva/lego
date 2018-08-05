module.exports = async function(site) {
  const fs = require('fs-extra');

  const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
  const { BUILD, LAYOUTS } = require('../utils/constants');

  try {
    let message = 'Creating posts from markdown';
    site.logger.await(message);

    let baseTemplate = fs.readFileSync(`${LAYOUTS}/post.html`).toString();
    let posts = site.getPosts();
    for (const post of posts) {
      let htmlPath = `${BUILD}/${post.path}`;
      fs.mkdirp(htmlPath);

      let renderedHtml = await generateHtmlFromLiquid(baseTemplate, { post });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }

    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
