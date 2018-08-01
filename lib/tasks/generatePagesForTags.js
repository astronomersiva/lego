const fs = require('fs-extra');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const { BUILD, LAYOUTS } = require('../utils/constants');

module.exports = async function(site) {
  try {
    let baseTemplate = fs.readFileSync(`${LAYOUTS}/tag.html`).toString();
    let tags = [...new Set(site.getTags())];
    let posts = site.getPosts();

    for (const tag of tags) {
      let htmlPath = `${BUILD}/tag/${tag}`;
      fs.mkdirp(htmlPath);

      let renderedHtml = await generateHtmlFromLiquid(baseTemplate, { posts, tag });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }
  } catch (error) {
    throw error;
  }
}
