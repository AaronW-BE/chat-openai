const fastify = require('fastify')({ logger: true })
const uuid = require('uuid');
const {Configuration, OpenAIApi} = require('openai');
const config = require('./config');
const messageRepo = require("./repository/message");

const chatConfiguration = new Configuration({
  apiKey: config.API_KEY,
  organization: config.ORG
})

fastify.register(
  require('./config/mongo').plugin,
  {
    user: config.MONGO_USER,
    pass: config.MONGO_PASS,
    dbName: config.MONGO_DB,
    host: config.MONGO_HOST,
    port: config.MONGO_PORT
  }
)

const start = async () => {
  try {
    await fastify.listen({
      host: "0.0.0.0",
      port: 3000
    });
  } catch (e) {
    fastify.log.error(e.message);
    process.exit(1);
  }
}

start().then();

const openai = new OpenAIApi(chatConfiguration);

fastify.get('/', async (request, reply) => {
  let {uid, text, platform} = request.query;

  if (!text) {
    return "";
  }

  if (!uid) {
    uid = uuid.v4();
  }

  messageRepo.add(uid, {
    role: "user",
    content: text
  })

  let totalMessages = messageRepo.get(uid);

  // formatted messages
  let formattedMsg = totalMessages.map(msg => msg.content);

  try {
    reply.header('uid', uid);

    const result = await openai.createChatCompletion({
      model: config.MODEL,
      messages: formattedMsg,
    });

    return result.data.choices[0].message.content;
  } catch (e) {
    return "error" + e.message;
  }
})
