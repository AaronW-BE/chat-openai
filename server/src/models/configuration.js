const {Schema, model} = require("mongoose");

const schema = {
  name: "configuration",
  schema: new Schema({
    group: String,
    createAt: Date
  })
}

module.exports = model(schema.name, schema.schema);