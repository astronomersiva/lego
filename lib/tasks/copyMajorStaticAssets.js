module.exports = async function(site, options = {}) {
  const fs = require('fs-extra');
  const path = require('path');
  const glob = require('glob');

  let postcss;
  let postcssPresetEnv;
  let cssnano;
  let terser;
  const isDevelopment = site.isDevelopment();

  let postCSSPlugins = site.getConfig().postCSSPlugins || [];
  let isPostCssNeeded = isDevelopment || postCSSPlugins;
  let postCSSPluginsForProd = [];

  // just requiring these adds about 2-3 seconds to startup
  if (isPostCssNeeded) {
    postcss = require('postcss');

    if (!isDevelopment) {
      cssnano = require('cssnano');
      postcssPresetEnv = require('postcss-preset-env');

      postCSSPluginsForProd.push(cssnano(), postcssPresetEnv());
    }
  }

  if (!isDevelopment) {
    terser = require('terser');
  }

  const filterFileList = require('../utils/filterFileList');
  const { STATIC, BUILD } = require('../utils/constants');

  try {
    let assets;
    if (options.event === 'change') {
      assets = [options.path];
    } else {
      assets = glob.sync(`${STATIC}/+(js|css)/**/*`);
      assets = filterFileList(assets, ['js', 'css']);
    }

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
        let result = isDevelopment ? contents : terser.minify(contents).code;
        fs.writeFileSync(destination, result);
      } else if (extension === '.css') {
        let result = isPostCssNeeded
          ? postcss(
            [
              ...postCSSPlugins.map(
                plugin => require(
                  // just requiring the plugin doesn't work when the package is linked
                  path.join(process.cwd(), 'node_modules', plugin)
                )()
              ),

              ...postCSSPluginsForProd
            ]
          ).process(contents, { from: asset, to: destination })
          : contents;

        cssPromises.push(result);
        cssDestinations.push(destination);
      }
    }

    let cssResults = isPostCssNeeded ? await Promise.all(cssPromises) : cssPromises;
    for (let index in cssResults) {
      let cssResult = cssResults[index];
      let destination = cssDestinations[index];

      let result = isPostCssNeeded ? cssResult.css : cssResult;
      fs.writeFileSync(destination, result);
    }

    site.logger.success('Copying static assets');
  } catch (error) {
    throw error;
  }
}
