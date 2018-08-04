const glob = require('glob');
const Version = require('node-version-assets');

const filterFileList = require('../utils/filterFileList');
const { BUILD, MEDIA } = require('../utils/constants');

module.exports = async function() {
  let formats = [...MEDIA, 'css', 'js'];
  let files = glob.sync(`${BUILD}/**/*.+(${formats.join('|')})`);
  let assets = filterFileList(files, formats);
  let grepFiles = glob.sync(`${BUILD}/**/*.+(html|css|js)`);
  console.log(grepFiles)
  let versionInstance = new Version({
    assets,
    grepFiles
  });

  const p = Promise.resolve({});
  await versionInstance.run(p);
}
