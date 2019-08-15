module.exports = async function(site) {
  const fs = require('fs-extra');
  const path = require('path');

  const { BUILD, STATIC } = require('../utils/constants');

  try {
    let message = `Cleaning ${BUILD} directory.`;
    let logger = site.getLogger();
    logger.time(message);

    if (fs.existsSync(BUILD) && site.isDevelopment()) {
      let allFiles = fs.readdirSync(BUILD);
      let filesToRemove = allFiles
        .filter(file => file !== STATIC)
        .map(file => path.join(BUILD, file));

      let staticContents = fs.readdirSync(path.join(BUILD, STATIC))
        .map(file => path.join(BUILD, STATIC, file));

      let staticContentsToRemove = staticContents.filter((file) => {
        return [
          path.join(BUILD, STATIC, 'css'),
          path.join(BUILD, STATIC, 'js')
        ].includes(file);
      });

      filesToRemove = [...filesToRemove, ...staticContentsToRemove];
      filesToRemove.map(file => fs.removeSync(file));
    } else {
      fs.emptyDirSync(BUILD);
    }

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
