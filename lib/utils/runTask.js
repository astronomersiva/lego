const tasks = require('./tasks');

module.exports = async function(task, site, options) {
  try {
    if (!Array.isArray(task)) {
      task = [task];
    }

    for (const taskUnit of task) {
      if (Array.isArray(taskUnit)) {
        let taskUnitPromises = [];
        for (const parallelTask of taskUnit) {
          taskUnitPromises.push(tasks[parallelTask](site, options));
        }

        await Promise.all(taskUnitPromises);
      } else {
        await tasks[taskUnit](site, options);
      }
    }
  } catch (error) {
    throw error;
  }
}
