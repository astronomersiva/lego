module.exports = function(files) {
  return files.filter((file) => {
    // Filters hidden files
    return !((/(^|\/)\.[^/.]/g).test(file));
  });
}
