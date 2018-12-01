const Liquid = require('liquid-node');
const engine = new Liquid.Engine();

const { LAYOUTS } = require('./constants');

// needed for `include` statements
engine.registerFileSystem(new Liquid.LocalFileSystem(LAYOUTS));

// custom filters
engine.registerFilters({
  sortByDate: function(array) {
    return array.sort(function(first, second) {
      return new Date(second.date) - new Date(first.date);
    });
  },

  sortByOrder: function(array) {
    return array.sort(function(first, second) {
      return Number(second.order) - Number(first.order);
    });
  }
});

module.exports = function(contents, options = {}) {
  return engine.parseAndRender(contents, options);
}
