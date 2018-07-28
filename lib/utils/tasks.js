const fs = require('fs-extra');
const path = require('path');
const filterFileList = require('./filterFileList');

const tasks = {};

const pathToTasks = path.join(__dirname, '../tasks');
const taskFiles = fs.readdirSync(pathToTasks, { encoding: 'utf8' });
const taskList = filterFileList(taskFiles, 'js');
taskList.forEach((task) => {
  tasks[path.parse(task).name] = require(path.join(pathToTasks, task));
});

module.exports = tasks;
