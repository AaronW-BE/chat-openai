const mongoose = require('mongoose');
const {model} = require("mongoose");
const { Schema } = mongoose;

let schema = {
  name: "user",
  schema: new Schema({
    nickname: String,
    avatar: String,
    createAt: Date,
    originFrom: String,
  }),
}
module.exports = model(schema.name, schema.schema);