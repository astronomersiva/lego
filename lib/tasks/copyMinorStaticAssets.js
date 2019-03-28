module.exports = async function(site, options = {}) {
  const fs = require('fs-extra');

  const cleanFileList = require('../utils/cleanFileList');
  const { STATIC, BUILD } = require('../utils/constants');

  try {
    let message = 'Copying static assets';
    let logger = site.getLogger();
    logger.time(message);

    let staticFiles;
    let minorStaticFiles = [];

    let { event, path } = options;
    if (!path) {
      staticFiles = cleanFileList(fs.readdirSync(STATIC));
      minorStaticFiles = staticFiles.filter((path) => !['css', 'js'].includes(path));
    } else {
      if (['add', 'change'].includes(event)) {
        minorStaticFiles = [path.replace(`${STATIC}/`, '')];
      } else if (event === 'unlink') {
        fs.remove(`${BUILD}/${path}`);
      }
    }

    let copyPromises = [];
    for (const asset of minorStaticFiles) {
      copyPromises.push(
        fs.copy(
          `${STATIC}/${asset}`,
          `${BUILD}/${STATIC}/${asset}`
        )
      );
    }

    await Promise.all(copyPromises);
    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
