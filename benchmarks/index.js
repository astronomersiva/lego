const Benchmark = require('benchmark');
const { execSync } = require('child_process');

const suite = new Benchmark.Suite; // eslint-ignore-line new-parens

// add tests
suite.add('jekyll', function() {
  execSync(`cd fixtures/jekyll && rm -rf _site && bundle exec jekyll build`)
}).add('lego without cache', function() {
  execSync(`cd fixtures/lego && rm -rf build && SKIP_CACHE=t lego`)
}).add('lego with cache', function() {
  execSync(`cd fixtures/lego && rm -rf build && lego`)
}).on('cycle', function(event) {
  console.log(String(event.target));
}).on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
}).run({ 'async': true });
