const path = require('path');
const cleanFileList = require('./cleanFileList');

// syntax sugar
const { MEDIA } = require('./constants');
let media = {};
MEDIA.forEach((format) => {
  media[format] = `.${format}`;
});

const extensions = {
  js: '.js',
  css: '.css',
  md: '.md',
  html: '.html'
};

Object.assign(extensions, media);

module.exports = function(files, allowedExtension) {
  let cleanedFileList = cleanFileList(files);
  return cleanedFileList.filter((file) => {
    // Checks if the file has the given extension
    if (Array.isArray(allowedExtension)) {
      let allowedExtensions = allowedExtension.map(ext => extensions[ext]);
      return allowedExtensions.includes(path.extname(file))
    }

    return (path.extname(file) === extensions[allowedExtension]);
  });
}
