module.exports = async function(site) {
  const fs = require('fs-extra');
  const sitemap = require('sitemap');

  const { BUILD } = require('../utils/constants');

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
