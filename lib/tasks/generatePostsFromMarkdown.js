module.exports = async function(site) {
  const fs = require('fs-extra');
  const path = require('path');

  const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
  const minifyHtml = require('../utils/minifyHtml');

  const { BUILD, LAYOUTS } = require('../utils/constants');

  try {
    let message = 'Creating posts from markdown';
    let logger = site.getLogger();
    logger.time(message);

    let baseTemplate = fs.readFileSync(`${LAYOUTS}/post.html`).toString();
    let posts = site.getPosts();
    let data = site.getData();
    let isDevelopment = site.isDevelopment();

    let htmlPromises = [];
    let htmlPaths = [];
    for (const post of posts) {
      let htmlPath = `${BUILD}/${post.path}`;
      fs.mkdirp(htmlPath);

      let template = post.layout
        ? fs.readFileSync(`${LAYOUTS}/${post.layout}`).toString()
        : baseTemplate;

      htmlPromises.push(generateHtmlFromLiquid(template, { post, posts, data, isDevelopment }));
      htmlPaths.push(`${htmlPath}/index.html`);
    }

    let renderedHtmlContents = await Promise.all(htmlPromises);

    let fileWritePromises = [];
    for (const index in renderedHtmlContents) {
      let renderedHtmlContent = renderedHtmlContents[index];
      fs.ensureDirSync(path.dirname(htmlPaths[index]));

      fileWritePromises.push(
        fs.writeFile(htmlPaths[index], minifyHtml(renderedHtmlContent, site.isDevelopment()))
      );
    }

    await Promise.all(fileWritePromises);

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
