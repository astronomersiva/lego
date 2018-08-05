module.exports = function(site) {
  const fs = require('fs-extra');
  const { BUILD } = require('../utils/constants');

  try {
    let message = 'Copying CNAME.';
    site.logger.await(message);

    let cname = 'CNAME';
    if (fs.existsSync(cname)) {
      fs.copySync(cname, `${BUILD}/${cname}`);
    }

    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
