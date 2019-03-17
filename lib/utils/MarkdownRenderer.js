const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const hljs = require('highlight.js');
const markdownIt = require('markdown-it');
const markdownItContainer = require('markdown-it-container');
const frontMatter = require('markdown-it-front-matter');
const mila = require('markdown-it-link-attributes')

const yamlToObject = require('./yamlToObject');
const { BUILD, LAYOUTS } = require('./constants');

const resizeImage = async(src, dest1x, dest2x, res) => {
  // hack as sharp doesnt work with /static
  if (src.startsWith('/')) {
    src = src.replace('/', '');
  }

  dest1x = path.join(BUILD, dest1x);
  dest2x = path.join(BUILD, dest2x);

  fs.mkdirpSync(path.dirname(dest1x));

  await sharp(src)
    .resize(Number(res))
    .toFile(dest1x);

  await sharp(src)
    .resize(Number(res) * 2)
    .toFile(dest2x);
}

let meta = {};

module.exports = class MdRender {
  constructor() {
    let md = markdownIt(
      {
        html: true,
        highlight: function(str) {
          try {
            return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`;
          } catch (err) {
            return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
          }
        }
      })
      .use(frontMatter, function(fm) {
        meta = yamlToObject(fm);
      })
      .use(markdownItContainer, 'include', {
        validate: function(params) {
          return params.endsWith(':::') && params.includes('include');
        },

        render: function(tokens, idx) {
          let statement = tokens[idx];
          if (statement.type === 'container_include_open') {
            let [, elements] = statement.info.trim().split(' ');
            return fs.readFileSync(`${LAYOUTS}/${elements}`).toString();
          }

          return '';
        }
      })
      .use(markdownItContainer, 'lego-image', {
        validate: function(params) {
          return params.endsWith(':::') && params.includes('lego-image');
        },

        render: function(tokens, idx) {
          let statement = tokens[idx];
          if (statement.type === 'container_lego-image_open') {
            let tagContents = statement.info.replace(':::', '').trim();
            let attributesRegex = /(\w+)="([\s\w,.\-_/@]+)"/g;
            let attributes = tagContents.match(attributesRegex);
            let attributeMap = {};
            for (let attribute of attributes) {
              let [key, value] = attribute.split('=');
              attributeMap[key] = value.replace(/"/g, '');
            }

            let resolutions = attributeMap.res || '';
            resolutions = resolutions.split(',').map(res => res.trim());
            let srcset = [];
            for (let res of resolutions) {
              let { src } = attributeMap;
              let extension = path.extname(src);
              let dest1x = src.replace(extension, `-${res}${extension}`)
              let dest2x = src.replace(extension, `-${res}@2x${extension}`)
              resizeImage(src, dest1x, dest2x, res);
              srcset.push({ res, dest1x, dest2x });
            }

            let sourceSrcset = '';
            for (let src of srcset) {
              sourceSrcset = `
                ${sourceSrcset}
                <source
                  srcset="${src.dest1x}, ${src.dest2x} 2x"
                  media="(min-width: ${src.res}px)"
                >
              `;
            }

            return `
              <picture>
                ${sourceSrcset}
                <img
                  class="${attributeMap.class || ''}"
                  alt="${attributeMap.alt || ''}"
                  src="${attributeMap.src || ''}"
                >
              </picture>
            `;
          }

          return '';
        }
      })
      .use(mila, {
        pattern: /^https?:\/\//,
        attrs: {
          target: '_blank',
          rel: 'noopener'
        }
      });

    this._md = md;
  }

  setupCustomContainer(name, options) {
    this._md = this._md.use(markdownItContainer, name, options);
  }

  renderMarkdown(markdown) {
    let html = this._md.render(markdown);
    return { html, meta };
  }
};
