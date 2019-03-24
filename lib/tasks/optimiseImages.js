module.exports = async function(site) {
  const imagemin = require('imagemin');
  const imageminMozjpeg = require('imagemin-mozjpeg');
  const imageminPngquant = require('imagemin-pngquant');
  const fs = require('fs-extra');
  const glob = require('glob');
  const path = require('path');

  const { BUILD, STATIC } = require('../utils/constants');

  try {
    let message = 'Optimising images';
    site.logger.await(message);

    // this monstrosity is because imagemin does not support
    // overwriting the images when a glob is provided.
    // PRs and issues related to this are closed without any
    // clear path forward

    // let images = glob.sync(`${STATIC}/**/*.+(${IMAGES.join('|')})`);
    // pass only png and jpg images through the optimiser for now
    let images = glob.sync(`${BUILD}/${STATIC}/**/*.+(png|jpg|jpeg)`);
    let imageOptimPromises = [];

    let cache = site.getCache();
    let cacheFlags = [];

    for (let index = 0; index < images.length; index++) {
      let image = images[index];
      let cachedOptimisedImg = cache.getCachedImage(image);

      if (cachedOptimisedImg) {
        imageOptimPromises.push(
          fs.writeFile(image, cachedOptimisedImg)
        );

        cacheFlags[index] = 0;
      } else {
        imageOptimPromises.push(
          imagemin([image], path.dirname(image), {
            plugins: [
              imageminMozjpeg(),
              imageminPngquant({quality: '65-80'})
            ]
          })
        );

        cacheFlags[index] = image;
      }
    }

    await Promise.all(imageOptimPromises);

    for (let index = 0; index < cacheFlags.length; index++) {
      let image = cacheFlags[index];
      if (image) {
        cache.setCachedImage(image, fs.readFileSync(images[index]));
      }
    }

    await cache.cleanImageCache();

    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
