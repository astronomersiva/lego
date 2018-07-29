const Liquid = require('liquid-node');
const engine = new Liquid.Engine();

const { LAYOUTS } = require('./constants');

// needed for `include` statements
engine.registerFileSystem(new Liquid.LocalFileSystem(LAYOUTS));

module.exports = function(contents, options = {}) {
  return engine.parseAndRender(contents, options);
}
