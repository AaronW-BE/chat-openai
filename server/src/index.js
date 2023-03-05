const fastify = require('fastify')({ logger: true })
const uuid = require('uuid');
const {Configuration, OpenAIApi} = require('openai');
const config = require('./config');
const messageRepo = require("./repository/message");

const chatConfiguration = new Configuration({
  apiKey: config.API_KEY,
  organization: config.ORG
})


const start = async () => {
  try {
    await fastify.listen({
      host: "0.0.0.0",
      port: 3000
    });
  } catch (e) {
    fastify.logger.error(e);
    process.exit(1);
  }
}

start().then();

const openai = new OpenAIApi(chatConfiguration);

fastify.get('/', async (request, reply) => {
  let {uid, text} = request.query;

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
