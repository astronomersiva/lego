const fs = require('fs-extra');
const path = require('path');

const cleanFileList = require('../utils/cleanFileList');
const { STATIC, BUILD } = require('../utils/constants');

module.exports = async function() {
  try {
    let staticFiles = cleanFileList(fs.readdirSync(STATIC));
    let minorStaticFiles = staticFiles.filter((path) => !['css', 'js'].includes(path));

    for (const asset of minorStaticFiles) {
      fs.copySync(
        path.join(STATIC, asset),
        path.join(BUILD, STATIC, asset)
      );
    }
  } catch (error) {
    throw error;
  }
}
