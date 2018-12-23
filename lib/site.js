const path = require('path');
const fs = require('fs-extra');
const glob = require('glob');
const findUp = require('find-up');
const {Signale} = require('signale');

const cleanBuild = require('./utils/cleanBuild');
const filterFileList = require('./utils/filterFileList');
const generateHtmlFromMd = require('./utils/generateHtmlFromMd');
const loadData = require('./utils/loadData');

const { BUILD, POSTS } = require('./utils/constants');

class Site {
  constructor(development = false) {
    this._development = development;
    this._posts = [];
    this._data = [];
    this._tags = [];
    this._assets = {};

    this.logger = new Signale({ interactive: true });
    if (process.env.DEBUG) {
      let consoleLog = console.log;
      // consoleLog = function() {};
      this.logger = {
        success: consoleLog,
        await: consoleLog,
        watch: consoleLog,
        fatal: consoleLog
      }
    }

    cleanBuild(this);
    this.logger.await('Preparing site');

    this.loadData();

    let configFile = findUp.sync('lego.js');
    if (!configFile) {
      throw new Error('lego.js not found. Are you sure this is a lego project?');
    }

    this._config = require(configFile) || {};

    let posts = glob.sync(`${POSTS}/**/*.md`).map(post => post.replace(`${POSTS}/`, ''));
    let filteredPages = filterFileList(posts, 'md');

    for (const post of filteredPages) {
      let pageContents = fs.readFileSync(`${POSTS}/${post}`).toString();
      let { html, meta } = generateHtmlFromMd(pageContents);
      let postPath = this.getPathForPost(post, meta);
      let postData = Object.assign({
        path: postPath,
        html
      }, meta);

      if (meta.draft) {
        if (this._development) {
          this._posts.push(postData);
          this._tags = this._tags.concat(postData.tags || []);
        }
      } else {
        this._posts.push(postData);
        this._tags = this._tags.concat(postData.tags || []);
      }
    }

    this.logger.success('Preparing site');
  }

  populateTags() {
    let tags = [];
    let posts = this._posts || {};
    for (const post of posts) {
      tags = tags.concat(post.tags || []);
    }

    this._tags = [...tags];
  }

  loadData() {
    this._data = loadData(this.logger);
  }

  getPathForPost(post, meta) {
    let config = this.getConfig();
    let parsedPath = path.parse(post);
    let urlFromPath = config.skipDirsInPostUrls ? parsedPath.name : path.join(parsedPath.dir, parsedPath.name);
    let postPath = meta.url ? meta.url : urlFromPath;

    return postPath;
  }

  async handlePostChange(event, post) {
    let postName = path.parse(post).name;
    if (event === 'unlink') {
      this._posts = this._posts.filter(post => post.path !== postName);
      this.populateTags();

      await fs.remove(`${BUILD}/${postName}`);
    }

    if (['add', 'change'].includes(event)) {
      let pageContents = fs.readFileSync(post).toString();
      let { html, meta } = generateHtmlFromMd(pageContents);
      let postPath = this.getPathForPost(post, meta);
      let postData = Object.assign({
        path: postPath,
        html
      }, meta);

      if (event === 'add') {
        if (meta.draft) {
          if (this._development) {
            this._posts.push(postData);
          }
        } else {
          this._posts.push(postData);
        }
      } else {
        let changedPostIndex = this._posts
          .findIndex(element => element.path === postName);

        this._posts[changedPostIndex] = postData;
      }

      this.populateTags();
    }
  }

  // node-liquid is directly manipulating the params passed.
  // This causes pages to break. As a workaround, pass a new copy each time.

  getPosts() {
    return [...this._posts];
  }

  getTags() {
    return [...this._tags];
  }

  getConfig() {
    return {...this._config};
  }

  getData() {
    return {...this._data};
  }

  isDevelopment() {
    return this._development;
  }

  updateAsset(asset, revisedAsset) {
    this._assets[asset] = revisedAsset;
  }

  getRevisedAsset(asset) {
    return this._assets[asset];
  }
}

module.exports = Site;
