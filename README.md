# Lego [![Build Status](https://travis-ci.org/astronomersiva/lego.svg?branch=master)](https://travis-ci.org/astronomersiva/lego)

A custom built static site generator that powers [sivasubramanyam.me](https://sivasubramanyam.me) 🏋️‍

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
* Supports minification and uglification of JS and CSS file(with `browserslist`).
* Does asset revision of CSS and JS files.
* JPG and PNG images under `static` will be optimised with `imageoptim`.
* Automatic sitemap generation.
* Supports extracting and inlining critical CSS with [critical](https://github.com/addyosmani/critical).
* Generates images for various resolutions and automatically inserts `picture` elements with the corresponding `source` elements.
* Minifies output HTML.
* Supports including html in md by implementing a custom md syntax. `::: include table.html :::`.
* Live-reload during development.
* Copies CNAME to `build` directory, so will work with GH Pages.

### Directory structure

```
.
├── CNAME
├── README.md
├── layouts
│   ├── post.html             // will be used for markdown posts
│   └── tag.html              // will be used to generate tag wise listing of posts
├── pages
│   ├── 404.html
│   ├── about.html            // each of these will be put under a separate folder in build
│   └── index.html
├── data
│   ├── authors.yml
│   └── speakers.yaml         // will be available as data.authors and data.speakers
├── posts
│   ├── post.md
│   ├── another-post.md
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

### Installation

* Install `npm` and `Node`.
* Run `npm i -g @astronomersiva/lego`.

### Usage

* Run `lego g` to create a new site.
* Run `lego s` to run a server.
* Run `lego` to create an optimised build.
* To include an HTML in a markdown file, use ::: include table.html :::.
* To automatically generate images for various resolutions,
```
::: lego-image src="static/images/${IMAGE}" res="1080,500,320" alt="alternate text" class="img-responsive center-block" :::
```
* lego also exposes a `isDevelopment` variable that you can use to disable certain stuff in development. For example, analytics.

```
{% unless isDevelopment %}
  <!-- analytics code -->
{% endunless %}
```

### License

MIT © [Sivasubramanyam A](https://sivasubramanyam.me/)
