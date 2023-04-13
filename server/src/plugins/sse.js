const fastifyPlugin = require("fastify-plugin");


module.exports = fastifyPlugin(function (fastify, opts, done) {
  fastify.log.info("load sse plugin")

  let defaultHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  }

  let optHeaders = opts.headers || {};
  let streamHeaders = Object.assign({}, defaultHeaders, optHeaders);


  fastify.decorateReply('sse', function (chunk, options = {}) {
    this.raw.writeHead(200, streamHeaders);
  });

  done();
});
