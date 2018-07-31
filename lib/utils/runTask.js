const Logger = require('./logger');
const tasks = require('./tasks');

module.exports = async function(task, site) {
  const logger = new Logger();

  try {
    for (const taskUnit of task) {
      if (Array.isArray(taskUnit)) {
        let taskUnitPromises = [];
        for (const parallelTask of taskUnit) {
          logger.setMessage(`Running ${parallelTask}`);
          taskUnitPromises.push(tasks[parallelTask](site));
        }

        await Promise.all(taskUnitPromises);
      } else {
        await tasks[taskUnit](site);
      }
    }
  } catch (error) {
    logger.setError(error);
    throw error;
  }
}
