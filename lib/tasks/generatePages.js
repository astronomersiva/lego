const fs = require('fs-extra');
const path = require('path');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const filterFileList = require('../utils/filterFileList');
const { PAGES, BUILD } = require('../utils/constants');

module.exports = async function(site) {
  try {
    const posts = site.getPosts();
    const pages = fs.readdirSync(PAGES);
    const filteredPages = filterFileList(pages, 'html')
      .filter(page => page !== '404.html');

    for (const page of filteredPages) {
      const pageContents = fs.readFileSync(`${PAGES}/${page}`).toString();
      const htmlPath = `${BUILD}/${path.parse(page).name}`;
      fs.mkdirp(htmlPath);

      const renderedHtml = await generateHtmlFromLiquid(pageContents, { posts });
      fs.writeFileSync(`${htmlPath}/index.html`, renderedHtml);
    }

    // copy index/index.html to index.html also
    fs.copySync(`${BUILD}/index/index.html`, `${BUILD}/index.html`);

    // generate 404 page
    const pageContents = fs.readFileSync(`${PAGES}/404.html`).toString();
    const renderedHtml = await generateHtmlFromLiquid(pageContents, { posts });
    fs.writeFileSync(`${BUILD}/404.html`, renderedHtml);
  } catch (error) {
    throw error;
  }
}
