module.exports = async function(site) {
  const glob = require('glob');
  const fs = require('fs-extra');
  const critical = require('critical');
  const pLimit = require('p-limit');

  const { BUILD, STATIC, MAX_CONCURRENT } = require('../utils/constants');

  let siteOptions = site.getConfig().critical;
  if (!siteOptions) {
    return;
  }

  let message = 'Inlining Critical Styles';
  let logger = site.getLogger();
  logger.time(message);

  let htmlFiles = glob.sync(`${BUILD}/**/*.html`);
  htmlFiles = htmlFiles.filter(file => !file.startsWith(`${BUILD}/${STATIC}`));

  // Reduce the limit here as too many Chromium instances can end up slowing down the machine
  let limit = pLimit(MAX_CONCURRENT / 2);

  // Refer
  // https://github.com/pocketjoso/penthouse/issues/278
  // https://github.com/pocketjoso/penthouse/issues/250
  // This is not a memory leak, however the output looks ugly with too many warnings.
  // Hence, setting maxListeners to predetermined MAX_CONCURRENT*2 to reduce it.
  require('events').EventEmitter.defaultMaxListeners = MAX_CONCURRENT * 2;

  // this is to keep track of which tags have changed
  // and to update them in the cache once all rendering is done
  let cacheFlags = [];
  let cache = site.getCache();
  let criticalPromises = [];

  for (let file of htmlFiles) {
    // skip for empty files
    if (!fs.statSync(file).size) {
      criticalPromises.push('');
      cacheFlags.push(0);

      continue;
    }

    let cacheKey = fs.readFileSync(file);
    let cached = cache.getCached('critical', cacheKey);

    if (cached) {
      criticalPromises.push(cached);
      cacheFlags.push(0);
    } else {
      let src = file.replace(`${BUILD}/`, '');

      criticalPromises.push(
        limit(() => {
          return critical.generate({
            ...siteOptions,
            base: BUILD,
            src
          });
        })
      );

      cacheFlags.push(cacheKey);
    }
  }

  let results = await Promise.all(criticalPromises);
  for (let index = 0; index < results.length; index++) {
    let result = results[index];
    let processedHtml = result.toString();
    fs.writeFileSync(htmlFiles[index], processedHtml);

    // update cache
    let cacheKey = cacheFlags[index];
    if (cacheKey) {
      cache.setCache('critical', cacheKey, processedHtml);
    }
  }

  cache.saveCache('critical');

  logger.timeEnd(message);
}
