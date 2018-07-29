const fs = require('fs-extra');
const path = require('path');

const generateHtmlFromLiquid = require('../utils/generateHtmlFromLiquid');
const { LAYOUTS, BUILD } = require('../utils/constants');

module.exports = async function() {
  try {
    const pathTo404 = path.join(LAYOUTS, '404.html');
    const destination = path.join(BUILD, '404.html');

    const layout = fs.readFileSync(pathTo404).toString();
    const rendered404 = await generateHtmlFromLiquid(layout);

    fs.writeFileSync(destination, rendered404);
  } catch (error) {
    throw error;
  }
}
