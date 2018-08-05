const fs = require('fs-extra');

const { BUILD } = require('../utils/constants');

module.exports = function() {
  try {
    let cname = `${BUILD}/CNAME`;
    if (fs.existsSync(cname)) {
      fs.copySync('CNAME', cname);
    }
  } catch (error) {
    throw error;
  }
}
