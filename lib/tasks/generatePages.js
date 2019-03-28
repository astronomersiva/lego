module.exports = async function(site, options = {}) {
  const fs = require('fs-extra');
  const path = require('path');

  const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
  const minifyHtml = require('../utils/minifyHtml');
  const filterFileList = require('../utils/filterFileList');
  const { PAGES, BUILD } = require('../utils/constants');

  try {
    let message = 'Creating pages';
    let logger = site.getLogger();
    logger.time(message);

    let posts = site.getPosts();
    let data = site.getData();
    let isDevelopment = site.isDevelopment();

    let pages;
    let filteredPages;

    if (options.event === 'change' && options.path.startsWith(PAGES)) {
      filteredPages = [options.path.replace(PAGES, '')];
    } else {
      pages = fs.readdirSync(PAGES);
      filteredPages = filterFileList(pages, 'html')
        .filter(page => page !== '404.html');
    }

    let htmlPromises = [];
    let htmlPaths = [];

    for (const page of filteredPages) {
      let pageContents = fs.readFileSync(`${PAGES}/${page}`).toString();
      let htmlPath = BUILD;

      if (page !== 'index.html') {
        htmlPath = `${BUILD}/${path.parse(page).name}`;
        fs.mkdirp(htmlPath);
      }

      htmlPromises.push(generateHtmlFromLiquid(pageContents, { posts, data, isDevelopment }));
      htmlPaths.push(`${htmlPath}/index.html`);
    }

    let renderedHtmlContents = await Promise.all(htmlPromises);

    for (const index in renderedHtmlContents) {
      let renderedHtmlContent = renderedHtmlContents[index];
      fs.writeFileSync(htmlPaths[index], minifyHtml(renderedHtmlContent, site.isDevelopment()));
    }

    // generate 404 page
    let pageContents = fs.readFileSync(`${PAGES}/404.html`).toString();
    let renderedHtml = await generateHtmlFromLiquid(pageContents, { posts, data, isDevelopment });
    fs.writeFileSync(`${BUILD}/404.html`, minifyHtml(renderedHtml, site.isDevelopment()));

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
