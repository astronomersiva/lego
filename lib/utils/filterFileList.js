const path = require('path');
const cleanFileList = require('./cleanFileList');

// syntax sugar
const extensions = {
  js: '.js',
  css: '.css',
  md: '.md',
  html: '.html'
};

module.exports = function(files, extension) {
  let cleanedFileList = cleanFileList(files);
  return cleanedFileList.filter((file) => {
    // Checks if the file has the given extension
    if (Array.isArray(extension)) {
      return Object.values(extensions).includes(path.extname(file));
    }

    return (path.extname(file) === extensions[extension]);
  });
}
