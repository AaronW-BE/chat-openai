const path = require("path");
const fs = require('fs');
const dotenv = require('dotenv');

let confName = ".env";
const loadConfig = (env = '') => {
  const basePath = process.cwd();

  env && (confName = confName.concat('.', env));

  const confPath = path.resolve(process.cwd(), confName);

  if (!fs.existsSync(confPath)) {
    throw new Error("Local ENV file could not found!")
  }

  const confStr = fs.readFileSync(confPath).toString('utf-8');
  const conf = dotenv.parse(confStr);

  return Object.assign({}, conf);
}

module.exports = loadConfig()