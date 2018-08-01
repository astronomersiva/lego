const fs = require('fs-extra');
const sitemap = require('sitemap');

const { BUILD } = require('../utils/constants');

module.exports = async function(site) {
  try {
    let siteConfig = site.getConfig();
    let options = {
      hostname: siteConfig.domain
    };

    let siteMapForSite = sitemap.createSitemap({ options });
    fs.writeFileSync(`${BUILD}/sitemap.xml`, siteMapForSite.toString());
  } catch (error) {
    throw error;
  }
}
