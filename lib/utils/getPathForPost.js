const path = require('path');
const { POSTS } = require('./constants');

module.exports = function(post, url, flatUrls) {
  if (url) {
    return url;
  }

  let parsedPath = path.parse(post);
  let postPath = flatUrls
    ? parsedPath.name
    : path.join(parsedPath.dir, parsedPath.name);

  if (postPath.startsWith(POSTS)) {
    postPath = postPath.replace(path.join(POSTS, path.sep), '');
  }

  return postPath;
};
