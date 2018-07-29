const fs = require('fs-extra');
const path = require('path');

const { BUILD } = require('../utils/constants');

module.exports = async function() {
  try {
    await fs.copy('CNAME', path.join(BUILD, 'CNAME'));
  } catch (error) {
    throw error;
  }
}
