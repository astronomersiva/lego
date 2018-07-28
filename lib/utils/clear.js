const isWindows = !!/^win/.test(process.platform);
const isNode6 = Number(process.version.slice(1, 2)) >= 6;
const isWorkaroundNeeded = isWindows && isNode6;

function clear() {
  if (isWindows) {
    // Workaround for Windows with Node version 6
    // Based on: https://gist.github.com/KenanSulayman/4990953
    if (isWorkaroundNeeded) {
      process.stdout.write('\x1B[2J\x1B[0f');
      return;
    }

    process.stdout.write('\x1Bc');
    return;
  }

  console.clear();
}

module.exports = clear;
