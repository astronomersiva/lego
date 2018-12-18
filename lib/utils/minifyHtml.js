const { minify } = require('html-minifier');

module.exports = function(html, isDevelopment) {
  try {
    if (isDevelopment) {
      return html;
    }

    return minify(html, {
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true,
      removeComments: true
    });
  } catch (error) {
    throw error;
  }
}
