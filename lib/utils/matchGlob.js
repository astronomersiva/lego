const glob = require('glob');

module.exports = function(pattern) {
  return glob.sync(pattern, { nodir: true });
}
