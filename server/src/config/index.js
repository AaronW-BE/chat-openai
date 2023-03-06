const envSchema = require('env-schema')
const path = require("path");

const schema = {
  type: 'object',
  required: ['API_KEY'],
  properties: {
    PORT: { type: "number", default: 3000 },
    API_KEY: { type: "string" },
    ORG: { type: "string", default: "" },
  }
}

let confName = ".env";
process.env.NODE_ENV && (confName = confName.concat('.', process.env.NODE_ENV));

module.exports = envSchema({
  schema,
  dotenv: {
    path: path.resolve(process.cwd(), confName),
  },
});