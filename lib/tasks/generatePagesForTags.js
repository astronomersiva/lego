module.exports = async function(site) {
  const fs = require('fs-extra');

  const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
  const { BUILD, LAYOUTS } = require('../utils/constants');

  try {
    let message = 'Creating pages for tags';
    site.logger.await(message);

    let baseTemplate = fs.readFileSync(`${LAYOUTS}/tag.html`).toString();
    let tags = [...new Set(site.getTags())];
    let posts = site.getPosts();
    let data = site.getData();
    let isDevelopment = site.isDevelopment();

    for (const tag of tags) {
      let htmlPath = `${BUILD}/tag/${tag.toLowerCase()}`;
      fs.mkdirp(htmlPath);

      let renderedHtml = await generateHtmlFromLiquid(baseTemplate, { posts, tag, data, isDevelopment });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);

      site.logger.success(message);
    }
  } catch (error) {
    throw error;
  }
}
