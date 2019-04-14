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

    let dummyContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Your awesome site</title>
          <link href="/static/css/styles.css" rel="stylesheet">
        </head>
        <body>
          <h1>Your awesome site!</h1>
          <div>
            <p>To generate a production build of this site, run <code>lego build</code>.</p>
            <p>
              Facing trouble? File an issue on
              <a href="https://github.com/astronomersiva/lego/">GitHub!</a>
            </p>
          </div>
        </body>
      </html>
    `;
    fs.writeFileSync(`${sitePath}/${PAGES}/index.html`, dummyContent);

    let dummyCss = `
      html {
        box-sizing: border-box;
        font-size: 0.625;
      }
      
      * {
        margin: 0;
        padding: 0;
      }
      
      *,
      *:before,
      *:after {
        box-sizing: inherit;
      }
      
      body,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      ol,
      ul {
        margin: 0;
        padding: 0;
        font-weight: normal;
      }
      
      img {
        max-width: 100%;
        height: auto;
      }

      h1 {
        font-weight: 700;
        font-size: 5rem;
        margin: 2% 0px;
      }

      p {
        margin-bottom: 20px;
      }

      code {
        font-family: monospace;
        background-color: rgb(255, 195, 54);
        color: black;
        font-size: 1.1rem;
      }

      a, a:link, a:visited, a:hover, a:active {
        color: white;
        text-decoration: none;
        border-bottom: 2px solid white;
      }

      body {
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        color: white;
        font-size: 1rem;
        padding: 0px 30px;
        background: linear-gradient(25deg, rgb(99, 86, 221), rgb(172, 73, 159), rgb(210, 59, 98), rgb(236, 42, 34));
      }
    `;
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
