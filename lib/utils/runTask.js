const Logger = require('./logger');
const tasks = require('./tasks');

module.exports = async function(task, site, options) {
  const logger = new Logger();

  try {
    if (!Array.isArray(task)) {
      task = [task];
    }

    for (const taskUnit of task) {
      if (Array.isArray(taskUnit)) {
        let taskUnitPromises = [];
        for (const parallelTask of taskUnit) {
          logger.setMessage(`Running ${parallelTask}`);
          taskUnitPromises.push(tasks[parallelTask](site, options));
        }

        await Promise.all(taskUnitPromises);
      } else {
        await tasks[taskUnit](site, options);
      }
    }
  } catch (error) {
    logger.setError(error);
    throw error;
  }
}
