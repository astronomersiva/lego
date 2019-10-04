const cloneDeep = require('lodash.clonedeep');

const generateHtmlFromLiquid = require('./generateHtmlFromLiquid');
const generateHtmlFromNunjucks = require('./generateHtmlFromNunjucks');

module.exports = function(contents, options) {
  if (options._EXTENSION === '.liquid') {
    return generateHtmlFromLiquid(contents, options);
  }

  // use nunjucks for .html and .njk as this is faster than the liquid parser

  // nunjucks is messing with the passed objects, so deepClone then before handing off.
  return generateHtmlFromNunjucks(contents, cloneDeep(options));
}
