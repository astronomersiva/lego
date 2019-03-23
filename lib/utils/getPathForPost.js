const path = require('path');

module.exports = function(post, url, skipDirsInPostUrls) {
  if (url) {
    return url;
  }

  let parsedPath = path.parse(post);
  let postPath = skipDirsInPostUrls
    ? parsedPath.name
    : path.join(parsedPath.dir, parsedPath.name);

  return postPath;
};
