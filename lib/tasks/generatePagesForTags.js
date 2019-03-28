module.exports = async function(site) {
  const fs = require('fs-extra');

  const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
  const minifyHtml = require('../utils/minifyHtml');
  const { BUILD, LAYOUTS } = require('../utils/constants');

  try {
    let message = 'Creating pages for tags';
    let logger = site.getLogger();
    logger.time(message);

    let baseTemplate = fs.readFileSync(`${LAYOUTS}/tags.html`).toString();
    let tags = [...new Set(site.getTags())];
    let posts = site.getPosts();
    let data = site.getData();
    let isDevelopment = site.isDevelopment();

    let htmlGenPromises = [];
    let htmlPaths = [];
    for (const tag of tags) {
      let htmlPath = `${BUILD}/tags/${tag.toLowerCase()}`;
      fs.mkdirp(htmlPath);

      let renderedHtml = generateHtmlFromLiquid(baseTemplate, { posts, tag, data, isDevelopment });
      htmlGenPromises.push(renderedHtml);
      htmlPaths.push(`${htmlPath}/index.html`);
    }

    let renderedHtmlContents = await Promise.all(htmlGenPromises);

    for (const index in renderedHtmlContents) {
      const html = renderedHtmlContents[index];
      fs.writeFileSync(htmlPaths[index], minifyHtml(html, site.isDevelopment()));
    }

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
