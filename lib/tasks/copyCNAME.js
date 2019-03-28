module.exports = function(site) {
  const fs = require('fs-extra');
  const { BUILD } = require('../utils/constants');

  try {
    let cname = 'CNAME';
    if (fs.existsSync(cname)) {
      let message = 'Copying CNAME.';
      let logger = site.getLogger();
      logger.time(message);

      fs.copySync(cname, `${BUILD}/${cname}`);

      logger.timeEnd(message);
    }
  } catch (error) {
    throw error;
  }
}
