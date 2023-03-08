const fastify = require('fastify')({ logger: true })
const uuid = require('uuid');
const {Configuration, OpenAIApi} = require('openai');
const config = require('./config');
const messageRepo = require("./repository/message");
const User = require('./models/user');
const Message = require('./models/message');
const {WeAppServerApi} = require("./libs/weapp");
const ThirdUserAccount = require('./models/thirdAccount');
const repl = require("repl");
const matcher = require('micromatch');

const serverApi = new WeAppServerApi({
  appId: config.WEAPP_APP_ID,
  appSecret: config.WEAPP_APP_SECRET
});

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

fastify.register(require('@fastify/jwt'), {
  secret: config.APP_SECRET_KEY,
  sign: {
    expiresIn: config.APP_AUTH_JWT_EXPIRE_IN,
    iss: config.APP_AUTH_JWT_ISS
  },
  formatUser: async (user) => {
    // obtain user base info
    let storeUser = await User.findOne({
      _id: "6406e6e86947858c29b2bcb4"
    });
    if (storeUser) {
      return {
        uid: user.uid,
        nickname: storeUser.nickname,
        createAt: storeUser.createAt,
        avatar: storeUser.avatar
      };
    }
    return {};
  }
})

const excludeAuth = config.APP_AUTH_WHITELIST
fastify.addHook("onRequest", async (request, reply) => {
  let skip = false;
  for (let pattern of excludeAuth) {
    // match
    if (matcher.isMatch(request.url, pattern)) {
      skip = true;
      break;
    }
  }
  if (skip) return;

  try {
    await request.jwtVerify();
  } catch (e) {
    fastify.log.info("jwt verify failed" + e.message);
    reply.send(e)
  }
})

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
fastify.get('/ping', async (req, res) => {
  return "pong";
})

fastify.get('/', async (request, reply) => {
  let {text} = request.query;

  // get history messages
  let messageRepo = await Message.findOne({
    from: request.user.uid,
    to: "bot"
  })

  // meg pack
  let msg = {
    role: "user",
    content: text,
    createAt: Date.now()
  };

  if (!messageRepo) {
    messageRepo = await Message.create({
      from: request.uid,
      to: "bot",
      pool: [ msg ],
      createAt: Date.now(),
    })
  } else {
    // append msg to repo
    messageRepo.pool.push(msg)
    await messageRepo.save();
  }

  // formatted messages
  let formattedMsg = messageRepo.pool.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  try {
    const result = await openai.createChatCompletion({
      model: config.MODEL,
      messages: formattedMsg,
    });

    const answer = result.data.choices[0].message.content || "";

    if (answer) {
      messageRepo.pool.push({
        role: "bot",
        content: answer,
        createAt: Date.now()
      })
    }
    return answer;

  } catch (e) {
    return "error" + e.message;
  }
})

fastify.get("/user", async (req, rep) => {
  return req.user;
})

fastify.post('/auth/weapp', async (req, rep) => {
  let {code, appid} = req.body;

  let ret = await serverApi.code2session(code);

  const {openid, unionid, session_key} = ret;

  // find 3rd account for login user
  let foundAccount = await ThirdUserAccount.findOne({
    'platform': 'weapp',
    'data.openid': openid
  })

  if (!foundAccount) {
    // create one if not found
    let preparedUser = new User({
      nickname: 'WX_' + Date.now(),
      createAt: Date.now(),
      originFrom: "wechat"
    });
    let savedUser = await preparedUser.save();

    let userThirdAccount = new ThirdUserAccount({
      user: savedUser._id,
      platform: 'weapp',
      data: {
        appid,
        openid,
        unionid,
        session_key
      }
    });
    await userThirdAccount.save();
    foundAccount = userThirdAccount;
  }

  let token = fastify.jwt.sign({
    uid: foundAccount.user._id,
  })

  return {
    token,
    expire: fastify.jwt.options.sign.expiresIn
  };
})
