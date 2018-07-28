const fs = require('fs-extra');

module.exports = async function() {
  try {
    await fs.copy('CNAME', 'build/CNAME');
  } catch (error) {
    throw error;
  }
}
