const envSchema = require('env-schema')
const path = require("path");

const schema = {
  type: 'object',
  required: [ 'APP_SECRET_KEY', 'API_KEY'],
  properties: {
    APP_SECRET_KEY: { type: "string" },
    APP_AUTH_WHITELIST: {type: "string", separator: ","},
    APP_AUTH_JWT_EXPIRE_IN: {type: "number", default: 7200},
    APP_AUTH_JWT_ISS: {type: "string", default: ""},
    PORT: { type: "number", default: 3000 },
    API_KEY: { type: "string" },
    ORG: { type: "string", default: "" },
    MONGO_USER: { type: "string" },
    MONGO_PASS: { type: "string" },
    MONGO_DB: { type: "string" },
    MONGO_HOST: { type: "string" },
    MONGO_PORT: { type: "number", default: "27017" },

    WEAPP_APP_ID: { type: "string" },
    WEAPP_APP_SECRET: { type: "string" }
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