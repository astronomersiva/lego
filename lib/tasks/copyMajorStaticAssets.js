module.exports = async function(site, options) {
  const fs = require('fs-extra');
  const path = require('path');
  const glob = require('glob');

  let postcss;
  let autoprefixer;
  let cssnano;
  let uglifyJS;
  const isDevelopment = site.isDevelopment();

  // just requiring these adds about 2-3 seconds to startup
  if (!isDevelopment) {
    postcss = require('postcss');
    autoprefixer = require('autoprefixer');
    cssnano = require('cssnano');
    uglifyJS = require('uglify-es');
  }

  const filterFileList = require('../utils/filterFileList');
  const { STATIC, BUILD } = require('../utils/constants');

  try {
    let assets = glob.sync(`${STATIC}/+(js|css)/**/*`);
    assets = filterFileList(assets, ['js', 'css']);

    let cssPromises = [];
    let cssDestinations = [];

    for (const asset of assets) {
      let destination = path.join(BUILD, asset);
      let destinationDir = `${BUILD}/${path.dirname(asset)}`;

      if (!fs.existsSync(destinationDir)) {
        fs.mkdirpSync(destinationDir);
      }

      let contents = fs.readFileSync(asset).toString();
      let extension = path.extname(asset);

      if (extension === '.js') {
        let result = isDevelopment ? contents : uglifyJS.minify(contents).code;
        fs.writeFileSync(destination, result);
      } else if (extension === '.css') {
        let result = isDevelopment
          ? contents
          : postcss([cssnano, autoprefixer]).process(contents, { from: asset, to: destination });

        cssPromises.push(result);
        cssDestinations.push(destination);
      }
    }

    let cssResults = isDevelopment ? cssPromises : await Promise.all(cssPromises);
    for (let index in cssResults) {
      let cssResult = cssResults[index];
      let destination = cssDestinations[index];

      let result = isDevelopment ? cssResult : cssResult.css;
      fs.writeFileSync(destination, result);
    }

    site.logger.success('Copying static assets');
  } catch (error) {
    throw error;
  }
}
