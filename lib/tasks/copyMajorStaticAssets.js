module.exports = async function(site, options) {
  const fs = require('fs-extra');
  const path = require('path');
  const glob = require('glob');
  const postcss = require('postcss');
  const autoprefixer = require('autoprefixer');
  const cssnano = require('cssnano');
  const uglifyJS = require('uglify-es');

  const filterFileList = require('../utils/filterFileList');
  const { STATIC, BUILD } = require('../utils/constants');

  try {
    let assets = glob.sync(`${STATIC}/+(js|css)/**/*`);
    assets = filterFileList(assets, ['js', 'css']);

    for (const asset of assets) {
      let destination = path.join(BUILD, asset);
      let destinationDir = `${BUILD}/${path.dirname(asset)}`;

      if (!fs.existsSync(destinationDir)) {
        fs.mkdirpSync(destinationDir);
      }

      let contents = fs.readFileSync(asset).toString();
      let extension = path.extname(asset);

      if (extension === '.js') {
        let result = uglifyJS.minify(contents);
        fs.writeFileSync(destination, result.code);
      } else if (extension === '.css') {
        let result = await postcss([cssnano, autoprefixer])
          .process(contents, { from: asset, to: destination });

        fs.writeFileSync(destination, result.css);
      }
    }

    site.logger.success('Copying static assets');
  } catch (error) {
    throw error;
  }
}
