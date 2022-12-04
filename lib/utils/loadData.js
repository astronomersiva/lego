async function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return await require(module);
}

module.exports = async function(logger) {
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

  ymlFiles.forEach((yml) => {
    let fileContents = fs.readFileSync(`${DATA}/${yml}`, 'utf8');
    try {
      let name = path.parse(yml).name;
      data[name] = YAML.safeLoad(fileContents);
    } catch (error) {
      logger.fatal(`YAML error at ${chalk.red(yml)} \n\n${(error)}`);
    }
  });

  let jsConfigs = filterFileList(files, ['js', 'json']);
  let loadJSConfigPromises = jsConfigs.map(async(config) => {
    try {
      let name = path.parse(config).name;
      let configFile = path.join(process.cwd(), DATA, config);

      data[name] = await requireUncached(configFile);
    } catch (error) {
      logger.fatal(`Error loading file ${chalk.red(config)} \n\n${(error)}`);
    }
  });

  await Promise.all(loadJSConfigPromises);
  return data;
}
