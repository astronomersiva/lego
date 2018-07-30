const Logger = require('./logger');
const tasks = require('./tasks');

module.exports = async function(task, site) {
  const logger = new Logger();

  try {
    logger.setMessage(`Running ${task}`);
    await tasks[task](site);
    logger.setMessage(`Finished running ${task}`);
  } catch (error) {
    logger.setError(error);
    throw error;
  }
}
