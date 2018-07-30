const fs = require('fs-extra');

const cleanFileList = require('../utils/cleanFileList');
const { STATIC, BUILD } = require('../utils/constants');

module.exports = async function() {
  try {
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
