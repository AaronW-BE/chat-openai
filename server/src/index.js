const fastify = require('fastify')({ logger: true })

const {Configuration, OpenAIApi} = require('openai');
const config = require('./config');

const chatConfiguration = new Configuration({
  apiKey: config.API_KEY,
  organization: config.ORG
})


const start = async () => {
  try {
    await fastify.listen({
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
  const result = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: request.query.text,
    max_tokens: 1024,
    temperature: 0,
    user: "aa"
  });
  console.log(result.data)
  return result.data.choices[0].text;
})