const fs = require('fs-extra');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const { BUILD, LAYOUTS } = require('../utils/constants');

module.exports = async function(site) {
  try {
    const baseTemplate = fs.readFileSync(`${LAYOUTS}/post.html`).toString();
    const posts = site.getPosts();
    for (const post of posts) {
      const htmlPath = `${BUILD}/${post.path}`;
      fs.mkdirp(htmlPath);

      const renderedHtml = await generateHtmlFromLiquid(baseTemplate, { post });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }
  } catch (error) {
    throw error;
  }
}
