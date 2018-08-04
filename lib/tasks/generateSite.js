const fs = require('fs-extra');

module.exports = function(site) {
  fs.mkdirpSync(`${site}/layouts`);
  fs.mkdirpSync(`${site}/pages`);
  fs.mkdirpSync(`${site}/posts`);
  fs.mkdirpSync(`${site}/static/css`);
  fs.mkdirpSync(`${site}/static/js`);
}
