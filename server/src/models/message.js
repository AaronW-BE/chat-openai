const {Schema, model, ObjectId, SchemaTypes} = require("mongoose");

const schema = {
  name: "message",
  schema: new Schema({
    from: {
      type: SchemaTypes.ObjectId,
      ref: "User"
    },
    to: String,
    pool: Array,
    createAt: Date
  })
}

module.exports = model(schema.name, schema.schema);