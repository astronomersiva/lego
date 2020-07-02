module.exports = async function(site) {
  const glob = require('glob');
  const fs = require('fs-extra');

  const { BUILD, STATIC } = require('../utils/constants');

  try {
    let { skipInstantPage } = site.getConfig();
    if (skipInstantPage) {
      return;
    }

    let message = 'Adding instant.page';
    let logger = site.getLogger();
    logger.time(message);

    let htmlFiles = glob.sync(`${BUILD}/**/*.html`);
    htmlFiles = htmlFiles.filter(file => !file.startsWith(`${BUILD}/${STATIC}`));

    let destination = `/${STATIC}/js/instantpage.js`;
    fs.copyFileSync(
      require.resolve('instant.page'),
      `${BUILD}${destination}`
    );

    for (let file of htmlFiles) {
      let html = fs.readFileSync(file).toString().replace(
        '</head>',
        `<script src="${destination}" defer></script></head>`
      );

      fs.writeFileSync(file, html);
    }

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
