const fastifyPlugin = require('fastify-plugin');
const fs = require('fs');
const path = require("path");

module.exports = fastifyPlugin(function (fastify, opts, done) {
  fastify.log.info("load i18n plugin")

  const localesPath = opts.localesPath || './locales'

  let localeFiles = fs.readdirSync(localesPath, {withFileTypes: true}).filter(file => file.isFile() && path.extname(file.name));
  let localeMap = {};
  localeFiles.map(file => {
    let content = require(path.join(localesPath, file.name))
    let lang = file.name.split('.')[0];
    localeMap[lang] = content;
  })

  let requestLang = opts.defaultLocale;

  fastify.addHook('onRequest', (request, reply, done) => {
    let langStr = request.headers['accept-language'];
    if (langStr) {
      let langArr = langStr.split(',');
      // always obtain primary lang in header
      if (localeMap[langArr[0]]) {
        requestLang = langArr[0];
      }
    }
    done();
  });

  fastify.decorate('t', function (key, options = {}) {
    if (options.lang) requestLang = options.lang;

    return localeMap[requestLang][key] || key;
  });

  done();
});