const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const {mongo} = require("mongoose");
// model path

let MODEL_DIR = path.resolve(__dirname, '../', 'models');

function filesInDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    let p = path.join(dir, file);

    if (p.toString() === path.join(__filename).toString()) continue;
    const stats = fs.statSync(p);
    if (stats.isDirectory()) {
      filesInDir(p, fileList);
    } else {
      fileList.push(p);
    }
  }
  return fileList;
}

function loadModels(dir = MODEL_DIR) {
  let files = filesInDir(dir);
  // require all models
  return files.map(file => {
    let schema = require(file);
    schema.model = mongoose.model(schema.name, schema.schema);
    schema.getModel = () => schema.model;
  })
}


module.exports = {
  loadModels
}