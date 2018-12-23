module.exports = function() {
  const fs = require('fs-extra');

  const { CERT_FILE, KEY_FILE } = require('./constants');
  if (fs.existsSync(KEY_FILE) && fs.existsSync(CERT_FILE)) {
    return;
  }

  fs.mkdirSync('tmp');

  const forge = require('node-forge')
  const pki = forge.pki;

  let keys = pki.rsa.generateKeyPair(2048);
  let cert = pki.createCertificate();

  cert.publicKey = keys.publicKey;

  // NOTE: serialNumber is the hex encoded value of an ASN.1 INTEGER.
  // Conforming CAs should ensure serialNumber is:
  // - no more than 20 octets
  // - non-negative (prefix a '00' if your value starts with a '1' bit)

  // set serialNumber to a unique value ~ timestamp
  cert.serialNumber = Date.now().toString();
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  let attrs = [{
    name: 'commonName',
    value: 'sivasubramanyam.me'
  }, {
    name: 'countryName',
    value: 'IN'
  }, {
    shortName: 'ST',
    value: 'TN'
  }, {
    name: 'localityName',
    value: 'legoland'
  }, {
    name: 'organizationName',
    value: '@astronomersiva/lego'
  }, {
    shortName: 'OU',
    value: 'Test'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'nsCertType',
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 6, // URI
      value: 'http://example.org/webid#me'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }, {
    name: 'subjectKeyIdentifier'
  }]);

  // self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // convert a Forge certificate to PEM
  let crt = pki.certificateToPem(cert);
  let key = pki.privateKeyToPem(keys.privateKey);

  fs.writeFileSync(KEY_FILE, key);
  fs.writeFileSync(CERT_FILE, crt);
};
