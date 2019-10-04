const dayjs = require('dayjs');
const nunjucks = require('nunjucks');

const { LAYOUTS } = require('./constants');

const nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(LAYOUTS), { autoescape: false });

nunjucksEnv.addGlobal('Date', new Date());

nunjucksEnv.addFilter('sortByDate', function(array) {
  return array.sort(function(first, second) {
    return new Date(second.date) - new Date(first.date);
  });
});

nunjucksEnv.addFilter('sortByOrder', function(array) {
  return array.sort(function(first, second) {
    return Number(second.order) - Number(first.order);
  });
});

nunjucksEnv.addFilter('randomElement', function(array) {
  return array[Math.floor(Math.random() * array.length)];
});

nunjucksEnv.addFilter('ceil', function(number) {
  return Math.ceil(number);
});

nunjucksEnv.addFilter('floor', function(number) {
  return Math.floor(number);
});

nunjucksEnv.addFilter('date', function(date, format) {
  return dayjs(date).format(format);
});

nunjucksEnv.addFilter('split', function(string, separator = '') {
  return string.split(separator);
});

module.exports = function(html, options = {}) {
  return nunjucksEnv.renderString(html, options);
}
