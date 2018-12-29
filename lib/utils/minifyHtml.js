const findUp = require('find-up');
const { minify } = require('html-minifier');

let configFile = findUp.sync('lego.js');
let config = {
  collapseWhitespace: true,
  minifyJS: true,
  minifyCSS: true,
  removeComments: true
};

if (configFile) {
  config = Object.assign(config, require(configFile).htmlMinifier);
}

module.exports = function(html, isDevelopment) {
  try {
    if (isDevelopment) {
      return html;
    }

    return minify(html, config);
  } catch (error) {
    throw error;
  }
}
