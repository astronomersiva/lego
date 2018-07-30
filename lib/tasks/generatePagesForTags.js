const fs = require('fs-extra');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const { BUILD, LAYOUTS } = require('../utils/constants');

module.exports = async function(site) {
  try {
    const baseTemplate = fs.readFileSync(`${LAYOUTS}/tag.html`).toString();
    const tags = [...new Set(site.getTags())];
    const posts = site.getPosts();

    for (const tag of tags) {
      const htmlPath = `${BUILD}/tag/${tag}`;
      fs.mkdirp(htmlPath);

      const renderedHtml = await generateHtmlFromLiquid(baseTemplate, { posts, tag });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }
  } catch (error) {
    throw error;
  }
}
