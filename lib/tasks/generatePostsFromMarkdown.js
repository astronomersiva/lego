const fs = require('fs-extra');
const path = require('path');
const md = require('markdown-it')();

const filterFileList = require('../utils/filterFileList');
const { BUILD, PAGES } = require('../utils/constants');

module.exports = async function() {
  try {
    const pages = fs.readdirSync(PAGES, { encoding: 'utf8' });
    const filteredPages = filterFileList(pages, 'md');

    if (!fs.existsSync(BUILD)) {
      fs.mkdirSync(BUILD);
    }

    for (const page of filteredPages) {
      const pageContents = fs.readFileSync(path.join(PAGES, page)).toString();
      const htmlPath = path.join(BUILD, path.parse(page).name);

      fs.mkdirp(htmlPath);
      fs.writeFileSync(path.join(htmlPath, 'index.html'), md.render(pageContents));
    }
  } catch (error) {
    throw error;
  }
}
