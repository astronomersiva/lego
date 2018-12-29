module.exports = async function(site) {
  const glob = require('glob');
  const fs = require('fs-extra');
  const path = require('path');
  const { inlineSource } = require('inline-source')

  const { BUILD, STATIC } = require('../utils/constants');

  try {
    let siteOptions = site.getConfig().inlineSource;
    if (!siteOptions) {
      return;
    }

    let message = 'Inlining Assets';
    site.logger.await(message);

    let htmlFiles = glob.sync(`${BUILD}/**/*.html`);
    htmlFiles = htmlFiles.filter(file => !file.startsWith(`${BUILD}/${STATIC}`));

    let inlineSourceOptions = Object.assign({
      rootpath: path.resolve(BUILD),
      // ES6 code will cause build failures if this is set as true
      compress: false,
      fs
    }, siteOptions);

    let inlinePromises = [];
    for (let file of htmlFiles) {
      let html = inlineSource(file, inlineSourceOptions);
      inlinePromises.push(html);
    }

    let inlinedHtmlContents = await Promise.all(inlinePromises);
    for (let [index, inlinedHtml] of inlinedHtmlContents.entries()) {
      fs.writeFileSync(htmlFiles[index], inlinedHtml);
    }

    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
