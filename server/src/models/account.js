const {model, Schema} = require("mongoose");

const scheme = {
  name: 'account',
  schema: new Schema({
    username: String,
    password: String,
    encryptType: {
      type: String,
      default: 'sha256'
    },
    loginLogs: [
      new Schema({
        time: Date,
        ua: String,
        ip: String,
        result: Object,
      })
    ],
    createAt: {
      type: Date,
      default: () => Date.now()
    },
  })
}

module.exports = model(scheme.name, scheme.schema);