module.exports = function(yaml) {
  let splitFm = yaml.split('\n');
  let data = {};

  for (const line of splitFm) {
    let [key, value] = line.split(':'); // eslint-disable-line no-unused-vars
    if (key === 'tags') {
      data[key] = value.split(',').map(v => v.trim());
    } else {
      data[key] = value.trim();
    }
  }

  return data;
}
