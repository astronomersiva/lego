module.exports = async function(site) {
  const fs = require('fs-extra');
  const { BUILD } = require('../utils/constants');

  try {
    let message = `Cleaning ${BUILD} directory.`;
    site.logger.await(message);

    await fs.emptyDirSync(BUILD)

    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
