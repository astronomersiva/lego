const fs = require('fs-extra');

module.exports = async function() {
  try {
    await fs.remove('build');
  } catch (error) {
    throw error;
  }
}
