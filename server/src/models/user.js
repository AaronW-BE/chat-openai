const mongoose = require('mongoose');
const { Schema } = mongoose;

module.exports = {
  name: "user",
  schema: new Schema({
    nickname: String,
    createAt: Date,
    originFrom: String,
  }),
  model: null,
}