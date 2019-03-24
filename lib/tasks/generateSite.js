module.exports = function(site) {
  const fs = require('fs-extra');
  const chalk = require('chalk');
  const { Signale } = require('signale');

  const { LAYOUTS, PAGES, POSTS, STATIC } = require('../utils/constants');

  try {
    let logger = new Signale({ interactive: true });
    logger.await(`Generating new lego project ${site}`);

    fs.mkdirpSync(`${site}/${LAYOUTS}`);
    fs.mkdirpSync(`${site}/${PAGES}`);
    fs.mkdirpSync(`${site}/${POSTS}`);
    fs.mkdirpSync(`${site}/${STATIC}/css`);
    fs.mkdirpSync(`${site}/${STATIC}/js`);

    fs.createFileSync(`${site}/${PAGES}/404.html`);
    fs.createFileSync(`${site}/${PAGES}/index.html`);
    fs.createFileSync(`${site}/${LAYOUTS}/post.html`);
    fs.createFileSync(`${site}/${LAYOUTS}/tags.html`);
    fs.createFileSync(`${site}/CNAME`);

    let configFile = `module.exports = {\n  name: '${site}',\n  url: ''\n}\n`;
    fs.writeFileSync(`${site}/lego.js`, configFile);

    logger.success(`Successfully generated project ${chalk.cyan(site)}.`);
  } catch (error) {
    throw error;
  }
}
