const fs = require('fs-extra');

const { LAYOUTS, PAGES, POSTS, STATIC } = require('../utils/constants');

module.exports = function(site) {
  fs.mkdirpSync(`${site}/${LAYOUTS}`);
  fs.mkdirpSync(`${site}/${PAGES}`);
  fs.mkdirpSync(`${site}/${POSTS}`);
  fs.mkdirpSync(`${site}/${STATIC}/css`);
  fs.mkdirpSync(`${site}/${STATIC}/js`);

  fs.createFileSync(`${site}/${PAGES}/404.html`);
  fs.createFileSync(`${site}/${PAGES}/index.html`);
  fs.createFileSync(`${site}/${LAYOUTS}/post.html`);
  fs.createFileSync(`${site}/${LAYOUTS}/tag.html`);
  fs.createFileSync(`${site}/CNAME`);
}
