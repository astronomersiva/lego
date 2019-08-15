module.exports = async function(site, options = {}) {
  const fs = require('fs-extra');
  const corePath = require('path');

  const cleanFileList = require('../utils/cleanFileList');
  const { STATIC, BUILD } = require('../utils/constants');

  try {
    let message = 'Copying static assets';
    let logger = site.getLogger();
    logger.time(message);

    let staticFiles;
    let minorStaticFiles = [];

    let { event, path } = options;

    // path is present when this task is triggered by the watcher
    if (!path) {
      const snapshotPath = corePath.join(process.cwd(), '.lego', 'staticfiles');
      if (!site.isDevelopment() && fs.existsSync(snapshotPath)) {
        fs.removeSync(snapshotPath);
      }

      let parcelWatcher;
      if (fs.existsSync(snapshotPath)) {
        parcelWatcher = require('@parcel/watcher');
        let events = await parcelWatcher.getEventsSince(STATIC, snapshotPath);
        let changedFiles = events.map(event => event.path.replace(`${process.cwd()}${corePath.sep}${STATIC}`, ''));
        staticFiles = cleanFileList(changedFiles);
      } else {
        staticFiles = cleanFileList(fs.readdirSync(STATIC));
      }

      // this is a workaround for Netlify
      if (parcelWatcher) {
        await parcelWatcher.writeSnapshot(STATIC, snapshotPath);
      }

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
