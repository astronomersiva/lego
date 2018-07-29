const fs = require('fs-extra');
const path = require('path');
const Liquid = require('liquid-node');
const engine = new Liquid.Engine();

const { LAYOUTS, BUILD } = require('../utils/constants');

// needed for `include` statements
engine.registerFileSystem(new Liquid.LocalFileSystem(LAYOUTS));

module.exports = async function() {
  try {
    const pathTo404 = path.join(LAYOUTS, '404.html');
    const destination = path.join(BUILD, '404.html');

    const layout = fs.readFileSync(pathTo404).toString();
    const rendered404 = await engine.parseAndRender(layout);

    fs.writeFileSync(destination, rendered404);
  } catch (error) {
    throw error;
  }
}
