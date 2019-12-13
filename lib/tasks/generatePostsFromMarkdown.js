const fs = require('fs-extra');
const path = require('path');

const matchGlob = require('../utils/matchGlob');
const { BUILD, LAYOUTS } = require('../utils/constants');
const BASE_TEMPLATE = matchGlob(`${LAYOUTS}/post.*`)[0];

module.exports = async function(site) {
  const generateHtmlFromTemplate = require('../utils/generateHtmlFromTemplate');
  const minifyHtml = require('../utils/minifyHtml');

  try {
    let message = 'Creating posts from markdown';
    let logger = site.getLogger();
    logger.time(message);

    let baseTemplate = fs.readFileSync(BASE_TEMPLATE).toString();
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

      let options = {
        _EXTENSION: path.extname(template),
        post,
        posts,
        data,
        isDevelopment
      };

      htmlPromises.push(generateHtmlFromTemplate(template, options));
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
