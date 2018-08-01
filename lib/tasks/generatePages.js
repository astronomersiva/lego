const fs = require('fs-extra');
const path = require('path');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const filterFileList = require('../utils/filterFileList');
const { PAGES, BUILD } = require('../utils/constants');

module.exports = async function(site) {
  try {
    let posts = site.getPosts();
    let pages = fs.readdirSync(PAGES);
    let filteredPages = filterFileList(pages, 'html')
      .filter(page => page !== '404.html');

    for (const page of filteredPages) {
      let pageContents = fs.readFileSync(`${PAGES}/${page}`).toString();
      let htmlPath = `${BUILD}/${path.parse(page).name}`;
      fs.mkdirp(htmlPath);

      let renderedHtml = await generateHtmlFromLiquid(pageContents, { posts });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }

    // copy index/index.html to index.html also
    fs.copySync(`${BUILD}/index/index.html`, `${BUILD}/index.html`);

    // generate 404 page
    let pageContents = fs.readFileSync(`${PAGES}/404.html`).toString();
    let renderedHtml = await generateHtmlFromLiquid(pageContents, { posts });
    fs.writeFileSync(`${BUILD}/404.html`, renderedHtml);
  } catch (error) {
    throw error;
  }
}
