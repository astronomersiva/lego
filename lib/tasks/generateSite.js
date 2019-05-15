module.exports = async function(site) {
  const fs = require('fs-extra');
  const path = require('path');
  const chalk = require('chalk');
  const { Signale } = require('signale');

  const { LAYOUTS, PAGES, POSTS, STATIC } = require('../utils/constants');

  const { version } = require('../../package.json');

  try {
    let logger = new Signale();

    let sitePath = path.resolve(site);
    let siteName = path.basename(sitePath);

    fs.mkdirpSync(`${sitePath}/${LAYOUTS}`);
    fs.mkdirpSync(`${sitePath}/${PAGES}`);
    fs.mkdirpSync(`${sitePath}/${POSTS}`);
    fs.mkdirpSync(`${sitePath}/${STATIC}/css`);
    fs.mkdirpSync(`${sitePath}/${STATIC}/js`);

    fs.createFileSync(`${sitePath}/${PAGES}/404.html`);
    fs.createFileSync(`${sitePath}/${LAYOUTS}/post.html`);
    fs.createFileSync(`${sitePath}/${LAYOUTS}/tags.html`);
    fs.createFileSync(`${sitePath}/CNAME`);

    let dummyHtml = fs.readFileSync(path.join(__dirname, '../utils/sample.html')).toString();
    fs.writeFileSync(`${sitePath}/${PAGES}/index.html`, dummyHtml);

    let dummyCss = fs.readFileSync(path.join(__dirname, '../utils/sample.css')).toString();
    fs.writeFileSync(`${sitePath}/${STATIC}/css/styles.css`, dummyCss);

    let configJson = {
      name: siteName,
      url: '',
      inlineSource: true,
      critical: {
        inline: true,
        dimensions: [
          {
            height: 800,
            width: 470
          }, {
            height: 900,
            width: 1200
          }
        ],
        penthouse: {
          timeout: 150000
        }
      }
    };

    fs.writeFileSync(`${sitePath}/lego.js`, `module.exports = ${JSON.stringify(configJson, null, 2)}`);

    let packageJson = {
      name: siteName,
      scripts: {
        start: 'lego s',
        build: 'lego'
      },
      browserslist: [
        '> 1%',
        'last 1 versions',
        'not ie 11',
        'not dead'
      ],
      devDependencies: {
        '@astronomersiva/lego': `^${version}`
      }
    };

    fs.writeFileSync(`${sitePath}/package.json`, JSON.stringify(packageJson, null, 2));

    logger.info(`Successfully generated project ${chalk.cyan(site)}.`);
    let cmdLogger = new Signale();
    cmdLogger.info(`Run ${chalk.cyan(`cd ${sitePath}`)} followed by ${chalk.cyan('lego s')} to start the development server.`);
  } catch (error) {
    throw error;
  }
}
