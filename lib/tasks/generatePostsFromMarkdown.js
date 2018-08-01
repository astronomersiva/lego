const fs = require('fs-extra');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const { BUILD, LAYOUTS } = require('../utils/constants');

module.exports = async function(site) {
  try {
    let baseTemplate = fs.readFileSync(`${LAYOUTS}/post.html`).toString();
    let posts = site.getPosts();
    for (const post of posts) {
      let htmlPath = `${BUILD}/${post.path}`;
      fs.mkdirp(htmlPath);

      let renderedHtml = await generateHtmlFromLiquid(baseTemplate, { post });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }
  } catch (error) {
    throw error;
  }
}
