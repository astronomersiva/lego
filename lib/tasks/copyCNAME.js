const fs = require('fs-extra');

const { BUILD } = require('../utils/constants');

module.exports = function() {
  try {
    fs.copySync('CNAME', `${BUILD}/CNAME`);
  } catch (error) {
    throw error;
  }
}
