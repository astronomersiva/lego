const fs = require('fs');
const path = require('path');
const randomWords = require('random-words');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);

async function generator(outputBasePath, layout) {
  let promises = [];
  for (let i = 0; i < 500; i++) {
    promises.push()
    let contents = `---\ntitle: Post ${i}\n${layout ? `layout: ${layout}\n` : ''}---\n`;

    let paras = 150;
    while (paras--) {
      contents += `${randomWords(150).join(' ')}\n\n`;
    }

    let outputPath = path.join(process.cwd(), `${outputBasePath}/post-${i}.md`);
    promises.push(writeFile(outputPath, contents));
  }

  await Promise.all(promises);
};

(async() => {
  await generator('fixtures/lego/posts');
  await generator('fixtures/jekyll/', 'default');
})();
