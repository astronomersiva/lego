module.exports = function(site) {
  const fs = require('fs-extra');
  const liveServer = require('live-server');
  const { BUILD, CERT_FILE, KEY_FILE } = require('../utils/constants');

  let config = site.getConfig();
  let options = Object.assign({
    port: 8181,
    host: '127.0.0.1',
    root: BUILD,
    open: true,
    wait: 50,
    logLevel: 0
  }, config.server);

  let ssl = config.server && config.server.ssl;
  if (ssl) {
    let httpsOptions = ssl;

    if (ssl.key && ssl.cert) {
      httpsOptions = {
        key: fs.readFileSync(ssl.key),
        cert: fs.readFileSync(ssl.cert)
      };
    } else {
      require('../utils/generateSslCert')();

      httpsOptions = {
        cert: fs.readFileSync(CERT_FILE),
        key: fs.readFileSync(KEY_FILE)
      };
    }

    options = {
      ...options,
      https: httpsOptions
    };
  }

  liveServer.start(options);
}
