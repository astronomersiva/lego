module.exports = function(site) {
  const fs = require('fs-extra');
  const glob = require('glob');
  const revHash = require('rev-hash');

  const { BUILD, STATIC } = require('../utils/constants');

  let message = 'Revisioning assets';
  site.logger.await(message);

  let fileRevisions = {};

  let cssFiles = glob.sync(`${BUILD}/${STATIC}/**/*.css`);
  let jsFiles = glob.sync(`${BUILD}/${STATIC}/**/*.js`);
  let staticAssets = [...cssFiles, ...jsFiles];

  for (let asset of staticAssets) {
    let hash = revHash(fs.readFileSync(asset));
    let revisedFile;

    if (asset.endsWith('.js')) {
      revisedFile = asset.replace('.js', `-${hash}.js`);
    } else {
      revisedFile = asset.replace('.css', `-${hash}.css`);
    }

    fs.moveSync(asset, revisedFile);
    fileRevisions[asset.replace(BUILD, '')] = revisedFile.replace(BUILD, '');
  }

  let htmlFiles = glob.sync(`${BUILD}/**/*.html`);
  for (let file of htmlFiles) {
    let fileContents = fs.readFileSync(file).toString();
    for (let revision in fileRevisions) {
      fileContents = fileContents.replace(revision, fileRevisions[revision]);
    }

    fs.writeFileSync(file, fileContents);
  }

  site.logger.success(message);
}
