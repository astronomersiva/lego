const path = require('path');

module.exports = function(files, extension) {
  return files.filter((file) => {
    // Checks if the file has the given extension, also filter hidden files
    return (path.extname(file) === `.${extension}`) &&
      !((/(^|\/)\.[^/.]/g).test(file));
  });
}
