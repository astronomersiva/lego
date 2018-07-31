const fs = require('fs-extra');
const path = require('path');
const markdownIt = require('markdown-it');
const markdownItContainer = require('markdown-it-container');
const frontMatter = require('markdown-it-front-matter');

const filterFileList = require('./utils/filterFileList');
const yamlToObject = require('./utils/yamlToObject');

const { POSTS, LAYOUTS } = require('./utils/constants');

let _post = {};

const mdOptions = {
  html: true
};

const md = markdownIt(mdOptions)
  .use(frontMatter, function(fm) {
    _post = yamlToObject(fm);
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

class Site {
  constructor() {
    this._posts = [];
    this._tags = [];

    const posts = fs.readdirSync(POSTS);
    const filteredPages = filterFileList(posts, 'md');

    for (const post of filteredPages) {
      const pageContents = fs.readFileSync(`${POSTS}/${post}`).toString();
      const renderedMarkdown = md.render(pageContents);
      let postData = Object.assign({
        path: path.parse(post).name,
        html: renderedMarkdown
      }, _post);

      this._posts.push(postData);
      this._tags = this._tags.concat(postData.tags || []);
    }
  }

  getPosts() {
    return this._posts;
  }

  getTags() {
    return this._tags;
  }
}

module.exports = Site;
