const mongoose = require('mongoose');
const {model} = require("mongoose");
const {passwordEncrypt} = require("../utils/encryptUtils");
const { Schema } = mongoose;

let schema = {
  name: "user",
  schema: new Schema({
    username: String,
    password: {
      type: String,
      set: function (val) {
        return passwordEncrypt(val, "sha256");
      }
    },
    nickname: String,
    avatar: String,
    createAt: {
      type: Date,
      default: Date.now
    },
    originFrom: String,
  }),
}

schema.schema.methods.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    if (this.password === passwordEncrypt(candidatePassword, "sha256")) {
      resolve(true);
    } else {
      resolve(false);
    }
  })
}
module.exports = model(schema.name, schema.schema);
