const fs = require('fs-extra');
const { BUILD } = require('../utils/constants');

module.exports = async function() {
  try {
    await fs.remove(BUILD);
  } catch (error) {
    throw error;
  }
}
