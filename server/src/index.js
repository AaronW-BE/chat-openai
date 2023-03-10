const fastify = require('fastify')({ logger: true })
const {Configuration, OpenAIApi} = require('openai');
const config = require('./config');
const User = require('./models/user');
const Message = require('./models/message');
const Gallery = require('./models/gallery');
const {WeAppServerApi} = require("./libs/weapp");
const ThirdUserAccount = require('./models/thirdAccount');
const matcher = require('micromatch');

const {Types} = require('mongoose')

let dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

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
    console.error(e);
    // fastify.log.info("jwt verify failed" + e.message);
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

  if (!text) {
    return;
  }

  // get today message quantity
  let msgCountToday = (await Message.aggregate([
    {
      $match: {
        from: new Types.ObjectId(request.user.uid),
        'pool.role': 'user',
        '$and': [
          {
            'pool.createAt': {
              $gte: dayjs.utc().hour(0).minute(0).second(0).millisecond(0).valueOf(),
              $lte: dayjs.utc().hour(23).minute(59).second(59).millisecond(999).valueOf()
            }
          }
        ],
      }
    },
    {
      $unwind: '$pool'
    }
  ]).exec()).length;

  console.debug('send msg today ' + msgCountToday)
  if (msgCountToday > 50) {
    // beyond max daily msg send
    return "??????????????????????????????????????????????????????????????????"
  }

  // get history messages
  let messageRepo = await Message.findOne({
    from: request.user.uid,
    to: "assistant"
  });

  // meg pack
  let msg = {
    role: "user",
    content: text,
    createAt: Date.now()
  };

  if (!messageRepo) {
    messageRepo = await Message.create({
      from: request.user.uid,
      to: "assistant",
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
      model: config.APP_WALLE_AI_MODEL,
      messages: formattedMsg,
    });

    const answer = result.data.choices[0].message.content || "";

    if (answer) {
      messageRepo.pool.push({
        role: "assistant",
        content: answer,
        createAt: Date.now()
      })
      messageRepo.save();
    }
    return answer;

  } catch (e) {

    return "error: " + e.message;
  }
})

// history chat msg
fastify.get('/chat', async (req, rep) => {
  const {start} = req.query;

  let filter = {
    from: new Types.ObjectId(req.user.uid),
  };

  if (start) {
    filter['pool.createAt'] = {
      $gte: dayjs(start).utc().valueOf()
    }
  }

  const msg = await Message.aggregate([
    { $match: filter },
    { $unwind: '$pool' },
    {
      $replaceRoot: {
        newRoot: "$pool"
      }
    }
  ]);
  return msg ? msg : [];
})

fastify.post('/img', async (req, rep) => {
  const {desc} = req.body;
  if (!desc) {
    return;
  }

  let ret = await openai.createImage({
    prompt: desc,
    n: 1,
    size: "1024x1024"
  });

  // find user gallery
  let gallery = await Gallery.findOne({
    owner: req.user.uid
  })

  if (!gallery) {
    gallery = new Gallery({
      owner: req.user.uid,
      stores: [],
      createAt: Date.now()
    })
  }

  gallery.stores.push({
    desc: desc,
    keyword: desc,
    images: ret.data.data,
    createAt: Date.now()
  })

  await gallery.save();

  return ret.data.data
})

fastify.get("/user", async (req, rep) => {
  return User.findById(req.user.uid);
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
