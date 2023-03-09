const mongoose = require('mongoose');

const {loadModels} = require("../models");

module.exports = {
  plugin: (fastify, options, done) => {
    let {user, pass, dbName, host, port} = options;

    mongoose.connect(`mongodb://${host}:${port}`, {
      user, pass, dbName,
      authSource: "admin",
      connectTimeoutMS: 1000,
    })
      .then(mongoose => {
        console.info("connect to mongodb success");
        fastify.mongoose = mongoose;
        done();
      })
      .catch(e => {
        console.warn("connect to mongodb failed with " + e.message);
      });
  }
}