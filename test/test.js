const assert = require('assert');
const path = require('path');
const fs = require('fs');
const fixturify = require('fixturify');
const { execSync } = require('child_process');

describe('lego', function() {
  this.timeout(60 * 1000);

  describe('build', function() {
    it('should build the project with cache disabled', async function() {
      let fixturePath = path.join(process.cwd(), 'test', 'fixtures', 'dummy');
      process.chdir(fixturePath);

      process.env.SKIP_CACHE = 'true';
      execSync('../../../bin/lego b');

      let expectedOutput = JSON.parse(fs.readFileSync('expected-output.json'));
      let actualOutput = fixturify.readSync('build');

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });

    it('should build the project with cache enabled', async function() {
      delete process.env.SKIP_CACHE;

      execSync('../../../bin/lego b');

      let expectedOutput = JSON.parse(fs.readFileSync('expected-output.json'));
      let actualOutput = fixturify.readSync('build');

      assert.deepStrictEqual(expectedOutput, actualOutput);

      // build again with cache
      execSync('../../../bin/lego b');
      actualOutput = fixturify.readSync('build');

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });

    it('should build the project with a pre-existing cache', async function() {
      delete process.env.SKIP_CACHE;

      execSync('../../../bin/lego b');

      let expectedOutput = JSON.parse(fs.readFileSync('expected-output.json'));
      let actualOutput = fixturify.readSync('build');

      assert.deepStrictEqual(expectedOutput, actualOutput);
    });
  });
});
