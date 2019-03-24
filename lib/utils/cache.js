const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');
const flatCache = require('flat-cache');

const { IMAGES } = require('../utils/constants');

class Cache {
  constructor(cacheDir) {
    cacheDir = cacheDir || path.join(process.cwd(), '.lego');
    this._cacheDir = cacheDir;
    this._cleanup = [];

    // This is an in-memory temporary cache to avoid
    // repeatedly calculating checksums for images.
    this._imageHashes = {};
  }

  computeHash(string) {
    return crypto.createHash('md5').update(string).digest('hex');
  }

  loadCache(type) {
    let cache;

    if (this[`_${type}`]) {
      cache = this[`_${type}`];
    } else {
      cache = flatCache.load(type, this._cacheDir);
      this[`_${type}`] = cache;
    }

    return cache;
  }

  getCached(type, key) {
    let cache = this.loadCache(type);
    let hash = this.computeHash(key);

    return cache.getKey(hash);
  }

  setCache(type, key, value, skipHashing) {
    let hash = skipHashing ? key : this.computeHash(key);

    let cache = this.loadCache(type);
    cache.setKey(hash, value);

    this[`_${type}`] = cache;
  }

  saveCache(type) {
    let cache = this.loadCache(type);
    cache.save(true);
  }

  getImageHash(image) {
    let hash = this._imageHashes[image];
    if (!hash) {
      hash = this.computeHash(fs.readFileSync(image));
      this._imageHashes[image] = hash;
    }

    return hash;
  }

  getCachedImage(image) {
    let key = this.getImageHash(image);
    let imagePath = path.join(this._cacheDir, key);

    if (fs.existsSync(imagePath)) {
      return fs.readFileSync(imagePath);
    }
  }

  getImageKeyWithoutRev(image) {
    let regex = new RegExp(`-\\w+\\.(${IMAGES.join('|')})$`);
    return image.replace(regex, '.$1');
  }

  setCachedImage(image, value) {
    let key = this.getImageHash(image);
    let imagePath = path.join(this._cacheDir, key);
    fs.writeFileSync(imagePath, value);

    // this is used to make sure that we do not cache
    // more than one version of the same image

    // while flat-cache has a way to remove unvisited
    // keys while saving, we will have to handle this
    // by ourselves since image cache is not implemented
    // with flat-cache
    let referenceCache = this.loadCache('imageref');
    let originalImageName = this.getImageKeyWithoutRev(image);
    let oldEntry = referenceCache.getKey(originalImageName);
    if (oldEntry && oldEntry !== key) {
      this._cleanup.push(path.join(this._cacheDir, oldEntry));
    }

    this.setCache('imageref', originalImageName, key, true);
  }

  async cleanImageCache() {
    let filesToRemove = this._cleanup;
    let fileRemovePromises = filesToRemove.map((file) => fs.remove(file));

    await Promise.all(fileRemovePromises);

    let referenceCache = this.loadCache('imageref');
    referenceCache.save(true);
  }
};

module.exports = Cache;
