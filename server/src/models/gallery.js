const {Schema, model} = require("mongoose");

const schema = {
  name: "user_image",
  schema: new Schema({
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    stores: [
      new Schema({
        desc: String,
        keyword: String,
        images: Array,
        createAt: Date
      })
    ],
    createAt: Date
  })
}

module.exports = model(schema.name, schema.schema);