module.exports = async function(site) {
  const imagemin = require('imagemin');
  const imageminMozjpeg = require('imagemin-mozjpeg');
  const imageminPngquant = require('imagemin-pngquant');
  const glob = require('glob');
  const path = require('path');

  const { BUILD, STATIC, IMAGES } = require('../utils/constants');

  try {
    let message = 'Optimising images';
    site.logger.await(message);

    // this monstrosity is because imagemin does not support
    // overwriting the images when a glob is provided.
    // PRs and issues related to this are closed without any
    // clear path forward
    let images = glob.sync(`${STATIC}/**/*.+(${IMAGES.join('|')})`);

    // skipping favicons
    images = images.filter(image => !image.includes('favicon'));

    let imageOptimPromises = [];
    for (let index = 0; index < images.length; index++) {
      let image = images[index];
      imageOptimPromises.push(
        imagemin([image], path.dirname(image.replace(STATIC, `${BUILD}/${STATIC}`)), {
          plugins: [
            imageminMozjpeg(),
            imageminPngquant({quality: '65-80'})
          ]
        })
      );
    }

    await Promise.all(imageOptimPromises);
    site.logger.success(message);
  } catch (error) {
    throw error;
  }
}
