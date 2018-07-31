const { minify } = require('html-minifier');

module.exports = function(html) {
  try {
    return minify(html, {
      collapseWhitespace: true,
      minifyJS: false,
      minifyCSS: false,
      removeComments: true
    });
  } catch (error) {
    throw error;
  }
}
