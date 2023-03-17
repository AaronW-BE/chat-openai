const crypto = require('crypto')

function encrypt2hash(plain, alg) {
  return  crypto.createHash(alg).update(plain).digest('hex');
}

module.exports = {
  sha256: text => encrypt2hash(text, 'sha256'),
  sha512: text => encrypt2hash(text, 'sha512'),
}