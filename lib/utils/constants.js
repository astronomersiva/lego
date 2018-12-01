const IMAGES = [
  'webp',
  'png',
  'jpg',
  'jpeg'
];

module.exports = {
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
