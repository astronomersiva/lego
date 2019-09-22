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
    const snapshotPath = corePath.join(process.cwd(), '.lego', 'staticfiles');

    // path is present when this task is triggered by the watcher
    if (!path) {
      if (!site.isDevelopment() && fs.existsSync(snapshotPath)) {
        fs.removeSync(snapshotPath);
      }

      let parcelWatcher;
      let shouldUpdateSnapshot;

      if (fs.existsSync(snapshotPath)) {
        parcelWatcher = require('@parcel/watcher');
        let events = await parcelWatcher.getEventsSince(STATIC, snapshotPath);
        let addedModifiedFiles = events.filter(event => event.type !== 'delete');
        let deletedFiles = events.filter(event => event.type === 'delete');
        deletedFiles.forEach((file) => {
          file = file.path.replace(process.cwd(), corePath.join(process.cwd(), corePath.sep, BUILD));
          fs.unlinkSync(file);
        })

        let changedFiles = addedModifiedFiles.map(event => event.path.replace(`${process.cwd()}${corePath.sep}${STATIC}`, ''));
        staticFiles = cleanFileList(changedFiles);
        shouldUpdateSnapshot = site.isDevelopment();
      } else {
        staticFiles = cleanFileList(fs.readdirSync(STATIC));
        shouldUpdateSnapshot = site.isDevelopment();
      }

      if (shouldUpdateSnapshot) {
        // This is a workaround for Netlify
        // This watcher needs a newer version of libc6

        parcelWatcher = require('@parcel/watcher');
        await parcelWatcher.writeSnapshot(STATIC, snapshotPath);
      }

      minorStaticFiles = staticFiles.filter((path) => !['css', 'js'].includes(path));
    } else {
      if (['add', 'change'].includes(event)) {
        minorStaticFiles = [path.replace(`${STATIC}/`, '')];
      } else if (event === 'unlink') {
        fs.remove(`${BUILD}/${path}`);
      }

      let parcelWatcher = require('@parcel/watcher');
      await parcelWatcher.writeSnapshot(STATIC, snapshotPath);
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
