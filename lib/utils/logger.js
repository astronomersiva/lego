const chalk = require('chalk');
const clear = require('./clear');

const {
  red,
  gray
} = chalk;

class Logger {
  refresh() {
    if (!process.env.DEBUG) {
      // clear();
    }

    // let { message, stack } = this;
    // process.stdout.write(`${message}\n\n\n`);
    // if (stack) {
    //   console.error(stack);
    // }
  }

  setError(error) {
    this.message = red(error.message);
    this.stack = error.stack;
    this.refresh();
  }

  setMessage(message) {
    this.message = gray(message);
    this.refresh();
  }
}

module.exports = Logger;
