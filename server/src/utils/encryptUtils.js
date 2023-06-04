const crypto = require('crypto')

function encrypt2hash(plain, alg) {
  return  crypto.createHash(alg).update(plain).digest('hex');
}

function passwordEncrypt(plain, alg) {
  return encrypt2hash(plain, alg);
}

module.exports = {
  sha1: text => encrypt2hash(text, 'sha1'),
  sha256: text => encrypt2hash(text, 'sha256'),
  sha512: text => encrypt2hash(text, 'sha512'),
  passwordEncrypt
}
