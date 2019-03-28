module.exports = async function(site) {
  const fs = require('fs-extra');
  const { BUILD } = require('../utils/constants');

  try {
    let message = `Cleaning ${BUILD} directory.`;
    let logger = site.getLogger();
    logger.time(message);

    await fs.emptyDirSync(BUILD)

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
