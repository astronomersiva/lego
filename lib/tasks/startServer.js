module.exports = function() {
  const liveServer = require('live-server');
  const { BUILD } = require('../utils/constants');

  const params = {
    port: 8181,
    host: '0.0.0.0',
    root: BUILD,
    open: true,
    wait: 500,
    logLevel: 1
  };

  liveServer.start(params);
}
