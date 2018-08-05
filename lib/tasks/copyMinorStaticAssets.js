module.exports = async function(site) {
  const fs = require('fs-extra');

  const cleanFileList = require('../utils/cleanFileList');
  const { STATIC, BUILD } = require('../utils/constants');

  try {
    let message = 'Copying static assets';
    site.logger.await(message);

    let staticFiles = cleanFileList(fs.readdirSync(STATIC));
    let minorStaticFiles = staticFiles.filter((path) => !['css', 'js'].includes(path));

    for (const asset of minorStaticFiles) {
      fs.copySync(
        `${STATIC}/${asset}`,
        `${BUILD}/${STATIC}/${asset}`
      );
    }
  } catch (error) {
    throw error;
  }
}
