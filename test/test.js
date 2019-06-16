const assert = require('assert');
const path = require('path');
const fs = require('fs');
const fixturify = require('fixturify');
const { execSync } = require('child_process');

function runLego(fixture) {
  let fixturePath = path.join(process.cwd(), 'test', 'fixtures', fixture);
  process.chdir(fixturePath);
  execSync('../../../bin/lego b');
}

function getExpectedOutput() {
  return JSON.parse(fs.readFileSync('expected-output.json'));
}

function getCurrentOutput() {
  return fixturify.readSync('build');
}

describe('lego', function() {
  this.timeout(60 * 1000);

  afterEach(() => {
    process.chdir('../../../');
  });

  describe('build', function() {
    it('should build the project with cache disabled', async function() {
      process.env.SKIP_CACHE = 'true';
      runLego('dummy');

      let expectedOutput = getExpectedOutput();
      let actualOutput = getCurrentOutput();

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });

    it('should build the project with cache enabled', async function() {
      delete process.env.SKIP_CACHE;
      runLego('dummy');

      let expectedOutput = getExpectedOutput();
      let actualOutput = getCurrentOutput();

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });

    it('should build the project with a pre-existing cache', async function() {
      delete process.env.SKIP_CACHE;
      runLego('dummy');

      let expectedOutput = getExpectedOutput();
      let actualOutput = getCurrentOutput();

      assert.deepStrictEqual(expectedOutput, actualOutput);

      // build again with cache
      execSync('../../../bin/lego b');
      actualOutput = getCurrentOutput();

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });

    it('should build the project with categories in posts enabled', async function() {
      runLego('categories');

      let expectedOutput = getExpectedOutput();
      let actualOutput = getCurrentOutput();

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });

    it('should build the project with categories in posts disabled', async function() {
      runLego('no-categories');

      let expectedOutput = getExpectedOutput();
      let actualOutput = getCurrentOutput();

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });
  });
});
