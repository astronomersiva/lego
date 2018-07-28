const fs = require('fs-extra');
const path = require('path');

const pathToTasks = path.join(__dirname, '../tasks');
const taskFiles = fs.readdirSync(pathToTasks, { encoding: 'utf8' });

const taskList = taskFiles.filter((file) => {
  // Checks if JS file, remove hidden files
  return (path.extname(file) === '.js') &&
    !((/(^|\/)\.[^/.]/g).test(file));
});

const tasks = {};
taskList.forEach((task) => {
  tasks[path.parse(task).name] = require(path.join(pathToTasks, task));
});

module.exports = tasks;
