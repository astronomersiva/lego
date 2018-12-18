const IMAGES = [
  'webp',
  'png',
  'jpg',
  'jpeg'
];

module.exports = {
  MAX_CONCURRENT: (require('os').cpus().length || 2) * 2,
  BUILD: 'build',
  PAGES: 'pages',
  POSTS: 'posts',
  STATIC: 'static',
  LAYOUTS: 'layouts',
  DATA: 'data',
  IMAGES,
  MEDIA: [
    ...IMAGES,
    'gif',
    'mp4'
  ]
}
