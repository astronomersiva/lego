const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const { PAGES, LAYOUTS, BUILD } = require('../utils/constants');
const BASE_TEMPLATE_404 = glob.sync(`${PAGES}/404.*`)[0];

module.exports = async function(site, options = {}) {
  const generateHtmlFromTemplate = require('../utils/generateHtmlFromTemplate');

  const minifyHtml = require('../utils/minifyHtml');
  const filterFileList = require('../utils/filterFileList');

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
      filteredPages = filterFileList(pages, ['html', 'md'])
        .filter(page => page !== path.basename(BASE_TEMPLATE_404));
    }

    let htmlPromises = [];
    let htmlPaths = [];

    for (const page of filteredPages) {
      let meta;
      let content;
      let pageContents = fs.readFileSync(`${PAGES}/${page}`).toString();
      let htmlPath = `${BUILD}/${path.parse(page).name}`;

      fs.mkdirp(htmlPath);

      if (path.extname(page) === '.md') {
        let renderedMd = site.renderMd(pageContents);

        meta = renderedMd.meta;
        content = renderedMd.html;

        pageContents = fs.readFileSync(`${LAYOUTS}/${meta.layout || 'default'}.html`).toString();
      }

      let htmlPromise = generateHtmlFromTemplate(pageContents, {
        _EXTENSION: path.extname(page),
        content: content || '',
        meta,
        posts,
        data,
        isDevelopment
      });

      htmlPromises.push(htmlPromise);
      htmlPaths.push(`${htmlPath}/index.html`);
    }

    let renderedHtmlContents = await Promise.all(htmlPromises);

    for (const index in renderedHtmlContents) {
      let renderedHtmlContent = renderedHtmlContents[index];
      fs.writeFileSync(htmlPaths[index], minifyHtml(renderedHtmlContent, site.isDevelopment()));
    }

    // copy index/index.html to index.html also
    fs.copySync(`${BUILD}/index/index.html`, `${BUILD}/index.html`);

    // live-reload doesn't work with BUILD/index.html. use this hack till it's fixed upstream
    if (!isDevelopment) {
      fs.removeSync(`${BUILD}/index`);
    }

    // generate 404 page
    let pageContents = fs.readFileSync(BASE_TEMPLATE_404).toString();
    let renderedHtml = await generateHtmlFromTemplate(pageContents, {
      _EXTENSION: path.extname(BASE_TEMPLATE_404),
      posts,
      data,
      isDevelopment
    });

    fs.writeFileSync(`${BUILD}/404.html`, minifyHtml(renderedHtml, site.isDevelopment()));

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
