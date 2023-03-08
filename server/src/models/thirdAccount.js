const {Schema, model, SchemaTypes} = require("mongoose");

let schema = {
  name: "third_party_account",
  schema: new Schema({
    user: {
      type: SchemaTypes.ObjectId
    },
    data: Object,
    platform: String,
    bindAt: Date
  })
}

module.exports = model(schema.name, schema.schema);