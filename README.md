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
* Supports minification and uglification of JS and CSS file(with `.browserlist.rc`).
* Does asset revision of CSS and JS files.
* JPG and PNG images under `static` will be optimised with `imageoptim`.
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
For example,
```
{% unless isDevelopment %}
  <!-- analytics code -->
{% endunless %}
```

### License

MIT © [Sivasubramanyam A](https://sivasubramanyam.me/)
