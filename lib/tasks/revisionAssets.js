module.exports = async function(site) {
  const fs = require('fs-extra');
  const path = require('path');
  const glob = require('glob');
  const revHash = require('rev-hash');

  const { BUILD, STATIC, IMAGES } = require('../utils/constants');

  let message = 'Revisioning assets';
  let logger = site.getLogger();
  logger.time(message);

  let cssFiles = glob.sync(`${BUILD}/${STATIC}/**/*.css`);
  let jsFiles = glob.sync(`${BUILD}/${STATIC}/**/*.js`);
  let images = glob.sync(`${BUILD}/${STATIC}/**/*.+(${IMAGES.join('|')})`);
  let htmlFiles = glob.sync(`${BUILD}/**/*.html`);

  try {
    let assetMap = {};

    const revisionAsset = async (asset) => {
      let fileContents = await fs.readFile(asset);
      let hash = revHash(fileContents);

      let parsedFilePath = path.parse(asset);
      // pathObject.name and pathObject.ext will be ignored if `base` is present.
      parsedFilePath.base = '';
      parsedFilePath.name = `${parsedFilePath.name}-${hash}`;

      let revisedFilePath = path.format(parsedFilePath);

      await fs.move(asset, revisedFilePath);
      assetMap[asset.replace(BUILD, '')] = revisedFilePath.replace(BUILD, '');
    };

    const revisionAssetsInFile = async (filePath) => {
      let fileContents = await fs.readFile(filePath);
      fileContents = fileContents.toString();

      for (let asset in assetMap) {
        fileContents = fileContents.replace(new RegExp(`${asset}([^.-])`, 'g'), `${assetMap[asset]}$1`);
      }

      await fs.writeFile(filePath, fileContents);
    };

    const replaceInsideFiles = (files) => {
      let reviseAssetsInsideFiles = [];
      for (let file of files) {
        reviseAssetsInsideFiles.push(revisionAssetsInFile(file));
      }

      return reviseAssetsInsideFiles;
    };

    const revisionAssets = (files) => {
      let reviseAssets = []
      for (let file of files) {
        reviseAssets.push(revisionAsset(file));
      }

      return reviseAssets;
    };

    // asset revisioning order:
    // * images -> they do not contain references to other assets
    // * css    -> they might contain references to images
    // * js     -> they can contain references to images and styles
    // * html   -> they contain references to all the above

    let reviseImages = revisionAssets(images);
    await Promise.all(reviseImages);

    let reviseAssetsInsideCss = replaceInsideFiles(cssFiles)
    await Promise.all(reviseAssetsInsideCss);

    let reviseCssAssets = revisionAssets(cssFiles);
    await Promise.all(reviseCssAssets);

    let reviseAssetsInsideJs = replaceInsideFiles(jsFiles);
    await Promise.all(reviseAssetsInsideJs);

    let reviseJsAssets = revisionAssets(jsFiles);
    await Promise.all(reviseJsAssets);

    let reviseAssetsInsideHtml = replaceInsideFiles(htmlFiles);
    await Promise.all(reviseAssetsInsideHtml);

    fs.ensureDirSync(`${BUILD}/${STATIC}`);

    fs.writeFileSync(
      `${BUILD}/${STATIC}/assetMap.json`,
      JSON.stringify(assetMap, null, 2)
    );

    logger.timeEnd(message);
  } catch (error) {
    throw error;
  }
}
