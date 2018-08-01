const fs = require('fs-extra');
const markdownIt = require('markdown-it');
const markdownItContainer = require('markdown-it-container');
const frontMatter = require('markdown-it-front-matter');

const yamlToObject = require('./yamlToObject');
const { LAYOUTS } = require('./constants');

const mdOptions = {
  html: true
};

let meta = {};

const md = markdownIt(mdOptions)
  .use(frontMatter, function(fm) {
    meta = yamlToObject(fm);
  })
  .use(markdownItContainer, 'include', {
    validate: function(params) {
      return params.endsWith(':::') && params.includes('include');
    },

    render: function(tokens, idx) {
      let statement = tokens[idx];
      if (statement.type === 'container_include_open') {
        let [, elements] = statement.info.trim().split(' ');
        return fs.readFileSync(`${LAYOUTS}/${elements}`).toString();
      }

      return '';
    }
  });

module.exports = function(pageContents) {
  let html = md.render(pageContents);
  return { html, meta };
}
