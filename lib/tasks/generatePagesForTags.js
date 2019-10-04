const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const { BUILD, LAYOUTS } = require('../utils/constants');
const BASE_TEMPLATE = glob.sync(`${LAYOUTS}/tags.*`)[0];

module.exports = async function(site) {
  const generateHtmlFromTemplate = require('../utils/generateHtmlFromTemplate');
  const minifyHtml = require('../utils/minifyHtml');

  try {
    let message = 'Creating pages for tags';
    let logger = site.getLogger();
    logger.time(message);

    let baseTemplatePath = BASE_TEMPLATE;
    if (!fs.existsSync(baseTemplatePath)) {
      return;
    }

    let baseTemplate = fs.readFileSync(baseTemplatePath).toString();

    let tags = [...new Set(site.getTags())];
    let posts = site.getPosts();
    let data = site.getData();
    let isDevelopment = site.isDevelopment();

    let htmlGenPromises = [];
    let htmlPaths = [];
    for (const tag of tags) {
      let htmlPath = `${BUILD}/tags/${tag.toLowerCase()}`;
      fs.mkdirpSync(htmlPath);

      let renderedHtml = generateHtmlFromTemplate(baseTemplate, {
        _EXTENSION: path.extname(BASE_TEMPLATE),
        posts,
        tag,
        data,
        isDevelopment
      });

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
