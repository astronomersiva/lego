module.exports = function(logger) {
  const fs = require('fs-extra');
  const filterFileList = require('./filterFileList');
  const { DATA } = require('./constants');

  if (!fs.existsSync(DATA)) {
    return {};
  }

  const path = require('path');
  const chalk = require('chalk');

  const YAML = require('js-yaml');

  let files = fs.readdirSync(DATA);
  let ymlFiles = filterFileList(files, ['yml', 'yaml']);
  let data = {};

  ymlFiles.map((yml) => {
    let fileContents = fs.readFileSync(`${DATA}/${yml}`, 'utf8');
    try {
      let name = path.parse(yml).name;
      data[name] = YAML.safeLoad(fileContents);
    } catch (error) {
      logger.fatal(`YAML error at ${chalk.red(yml)} \n\n${(error)}`);
    }
  });

  return data;
}
