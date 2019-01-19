module.exports = function(logger) {
  const fs = require('fs-extra');
  const filterFileList = require('./filterFileList');
  const { DATA } = require('./constants');

  if (!fs.existsSync(DATA)) {
    return {};
  }

  const path = require('path');
  const chalk = require('chalk');

  const YAML = require('yaml').default;

  let files = fs.readdirSync(DATA);
  let ymlFiles = filterFileList(files, ['yml', 'yaml']);
  let data = {};

  ymlFiles.map((yml) => {
    let fileContents = fs.readFileSync(`${DATA}/${yml}`).toString();
    try {
      data[path.parse(yml).name] = YAML.parse(fileContents);
    } catch (error) {
      logger.fatal(`YAML error at ${yml} \n\n${chalk.gray(error.source.toString())}`);
    }
  });

  return data;
}
