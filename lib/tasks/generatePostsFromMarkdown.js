const fs = require('fs-extra');
const path = require('path');
const markdownIt = require('markdown-it');
const frontMatter = require('markdown-it-front-matter');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const filterFileList = require('../utils/filterFileList');
const yamlToObject = require('../utils/yamlToObject');
const { BUILD, PAGES, LAYOUTS } = require('../utils/constants');

let postData = {};
const md = markdownIt()
  .use(frontMatter, function(fm) {
    postData = yamlToObject(fm);
  });

module.exports = async function() {
  try {
    const baseTemplate = fs.readFileSync(path.join(LAYOUTS, 'post.html')).toString();
    const pages = fs.readdirSync(PAGES, { encoding: 'utf8' });
    const filteredPages = filterFileList(pages, 'md');

    if (!fs.existsSync(BUILD)) {
      fs.mkdirSync(BUILD);
    }

    for (const page of filteredPages) {
      const pageContents = fs.readFileSync(path.join(PAGES, page)).toString();
      const htmlPath = path.join(BUILD, path.parse(page).name);

      fs.mkdirp(htmlPath);
      const renderedMarkdown = md.render(pageContents);
      const post = { html: renderedMarkdown };
      Object.assign(post, postData);
      const renderedHtml = await generateHtmlFromLiquid(baseTemplate, { page: post });

      fs.writeFileSync(path.join(htmlPath, 'index.html'), renderedHtml);
    }
  } catch (error) {
    throw error;
  }
}
