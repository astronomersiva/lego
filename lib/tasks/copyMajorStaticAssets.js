module.exports = async function(site, options = {}) {
  const fs = require('fs-extra');
  const path = require('path');
  const glob = require('glob');

  let message = 'Processing CSS and JS files';
  let logger = site.getLogger();
  logger.time(message);

  let postcss;
  let cssnano;
  let terser;

  const isDevelopment = site.isDevelopment();

  let postCSSPlugins = site.getConfig().postCSSPlugins || [];
  // postcss plugins need to be loaded if there are project specific
  // plugins or if the current build is a prod build.
  let isPostCssNeeded = postCSSPlugins.length || !isDevelopment;
  let defaultpostCSSPlugins = [];

  // just requiring these adds about 2-3 seconds to startup
  if (isPostCssNeeded) {
    postcss = require('postcss');
    cssnano = require('cssnano');

    defaultpostCSSPlugins.push(cssnano());
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

    let cache = site.getCache();
    let cacheFlags = [];
    // we need to bust cache if the plugins change
    let cacheTypeBase = `postcss${JSON.stringify(postCSSPlugins)}`;

    for (const asset of assets) {
      let destination = path.join(BUILD, asset);
      let destinationDir = `${BUILD}/${path.dirname(asset)}`;

      fs.ensureDirSync(destinationDir);

      let contents = fs.readFileSync(asset).toString();
      let extension = path.extname(asset);

      if (extension === '.js') {
        let result;
        if (isDevelopment) {
          result = contents;
        } else {
          let cached = cache.getCached('terser', contents);
          result = cached;

          if (!cached) {
            result = terser.minify(contents).code;
            cache.setCache('terser', contents, result);
          }
        }

        fs.writeFileSync(destination, result);
      } else if (extension === '.css') {
        let result;
        if (isPostCssNeeded) {
          let cached = cache.getCached(cacheTypeBase, contents);
          if (cached) {
            result = { css: cached };
            cacheFlags.push(0);
          } else {
            result = postcss(
              [
                ...postCSSPlugins.map(
                  plugin => require(
                    // just requiring the plugin doesn't work when the package is linked
                    path.join(process.cwd(), 'node_modules', plugin)
                  )()
                ),

                ...defaultpostCSSPlugins
              ])
              .process(contents, { from: asset, to: destination });

            cacheFlags.push(contents);
          }
        } else {
          result = contents;
        }

        cssPromises.push(result);
        cssDestinations.push(destination);
      }
    }

    let cssResults = isPostCssNeeded ? await Promise.all(cssPromises) : cssPromises;
    for (let index in cssResults) {
      let cssResult = cssResults[index];
      let destination = cssDestinations[index];

      let result = cssResult;
      if (isPostCssNeeded) {
        result = result.css;
        let cacheMissedCss = cacheFlags[index];
        if (cacheMissedCss) {
          cache.setCache(cacheTypeBase, cacheMissedCss, result);
        }
      }

      fs.writeFileSync(destination, result);
    }

    cache.saveCache('terser');
    cache.saveCache(cacheTypeBase);

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
