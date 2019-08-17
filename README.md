# Lego [![Build Status](https://travis-ci.org/astronomersiva/lego.svg?branch=master)](https://travis-ci.org/astronomersiva/lego)

A custom built static site generator that powers [siva.dev](https://siva.dev) 🏋️‍

### Why?

Having written several build tools at work over the last few years, I wanted to try my hands at
rolling out a full featured static site generator. I had been using Flask earlier to run several
applications and I also used that to power my site. Over the years, those applications were
decommissioned but the static site remained. It was getting increasingly difficult to maintain
a static site on Flask and I wanted to see what all it takes to build a static site generator.

This was a great learning experience to be honest.

### Tell me more

* Built with NodeJS.
* Supports Liquid templates.
* Supports minification and uglification of JS and CSS files(using the provided `browserslist` to determine transpilation targets).
* Does asset revisioning of CSS, JS and image files.
* Supports PostCSS plugins.
* Images under `static` will be optimised with `imageoptim`.
* Code highlighting at build time using [highlight.js](https://highlightjs.org/).
* Automatic sitemap and RSS feeds generation.
* Supports extracting and inlining critical CSS with [critical](https://github.com/addyosmani/critical).
* Supports inlining assets using [inline-source](https://www.npmjs.com/package/inline-source).
* Generates images for various resolutions and automatically inserts `picture` elements with the corresponding `source` elements.
* Minifies output HTML.
* Supports including html in md by implementing a custom md syntax. `::: include table.html :::`.
* Live-reload during development.
* Copies CNAME to `build` directory, so will work with GH Pages.
* Implements a cache resulting in faster builds on subsequent runs.

### Installation

* Run `npm i -g @astronomersiva/lego`.

### Usage

* Run `lego g siteName` to create a new site.
* Run `lego s` / `lego serve` to run a server.
* Run `lego b` / `lego build` to create an optimised build.
* To include an HTML in a markdown file, use ::: include table.html :::.
* To automatically generate images for various resolutions,
```
::: lego-image src="static/images/${IMAGE}" res="1080,500,320" alt="alternate text" class="img-responsive center-block" :::
```
* lego also exposes an `isDevelopment` variable that you can use to disable certain stuff in development. For example, analytics.

```
{% unless isDevelopment %}
  <!-- analytics code -->
{% endunless %}
```

### Directory structure

```
.
├── CNAME
├── README.md
├── layouts
│   ├── post.html             // will be used for markdown posts
│   └── tags.html             // will be used to generate tag wise listing of posts
├── pages
│   ├── 404.html
│   └── about.html            // each of these will be put under a separate folder in build
│   └── index.html
├── data
│   ├── authors.yml
│   └── speakers.yaml         // will be available as data.authors and data.speakers
├── posts
│   ├── post.md
│   └── another-post.md
└── static
    ├── css
    │   └── styles.css        // possible to have sub folders
    ├── images
    └── js
        └── custom-scripts.js
```

### Configuration file

Every lego project has a `lego.js` file at the root. It should have the following contents:

* `url`: This is needed to generate sitemaps. Example, `'https://www.sivasubramanyam.me/'`.
* `critical`: This can be used if critical CSS is to be inlined. Using this might significantly
increase production build times. Takes options applicable to [critical](https://github.com/addyosmani/critical).
Example,
```javascript
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
```
* `skipDirsInPostUrls`: If this option is set as `true`, the URL of generated posts will not
include directories. For example, in this tree structure,
```
.
└── posts
    ├── travel
    │   └── nepal.md
    └── i-love-js.md
```
the URL of nepal.md will be `site.com/nepal` if this option is `true`. By default(`false`), the URL
of this post would be `site.com/travel/nepal`. This option will be overridden if the post's front-matter
has a `url` field.
* `inlineSource`: If this option is set as `true`, assets in tags that contain the `inline` attribute
will be inlined. You can also pass options supported by [inline-source](https://www.npmjs.com/package/inline-source#usage).
* `server`: Options for the development server. Refer [live-server](https://github.com/tapio/live-server/#usage-from-node).
* `server.ssl`: If this option is set as `true`, lego will start an HTTPS development server using
a self-signed certificate. Please note that self-signed certificates might not be accepted
by many browsers by default. If you would like to use your own `cert` and `key` files, you
can do so by passing them to this option like,
```javascript
ssl: {
  key: 'server.key',
  cert: 'server.crt'
}
```
* `htmlMinifier` - Options for [html-minifier](https://github.com/kangax/html-minifier#options-quick-reference). Defaults are
```javascript
{
  collapseWhitespace: true,
  minifyJS: true,
  minifyCSS: true,
  removeComments: true
}
```
* `md`: Pass an array of block-level custom containers that can be used by the Markdown parser.
Refer [markdown-it-container](https://github.com/markdown-it/markdown-it-container).
```javascript
{
  md: {
    containers: [
      {
        name: 'myCustomContainer',
        options: {
          validate: function(params) {}
          render: function(tokens, idx) {}
        }
      }
    ]
  }
}
```
* `postCSSPlugins`: An array of PostCSS plugins. These will be used in addition to `cssnano` that is already included in lego.
```javascript
{
  postCSSPlugins: [
    'precss',
    'postcss-nested'
  ]
}
```
* `rss`: Options to pass to the RSS feeds generator. Refer [rss feedOptions](https://www.npmjs.com/package/rss#feedoptions).
  Categories and Publishing Date will be automatically populated.


### Benchmarks

To run benchmarks, run
```bash
$ cd benchmarks
$ yarn
$ node generator.js
$ node --max-old-space-size=4096 index.js
```

It will run benchmarks against `jekyll` the following data:

* 500 posts
* Each post contains 150 paragraphs.
* Each paragraph contains 150 random words.
* The size of each post is about 150kb.
* lego will be run with its cache disabled.
* No static files are present.

**While jekyll produces only a build, lego does HTML minification as well.**

Results:

```bash
jekyll x 0.04 ops/sec ±6.71% (5 runs sampled)
lego without cache x 0.06 ops/sec ±3.98% (5 runs sampled)
lego with cache x 0.06 ops/sec ±12.94% (5 runs sampled)
Fastest is lego without cache
```

### License

MIT © [Sivasubramanyam A](https://sivasubramanyam.me/)
