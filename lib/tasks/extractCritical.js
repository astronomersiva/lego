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
  site.logger.await(message);

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

  let criticalPromises = [];
  for (let file of htmlFiles) {
    criticalPromises.push(
      limit(() => {
        return critical.generate({
          ...siteOptions,
          base: BUILD,
          src: file.replace(`${BUILD}/`, '')
        });
      })
    );
  }

  let results = await Promise.all(criticalPromises);
  for (let index = 0; index < results.length; index++) {
    let result = results[index];
    fs.writeFileSync(htmlFiles[index], result.toString());
  }

  site.logger.success(message);
}
