const fastify = require('fastify')({ logger: false })
const cors = require('@fastify/cors');
const {Configuration, OpenAIApi} = require('openai');
const config = require('./config');
const User = require('./models/user');
const Message = require('./models/message');
const Gallery = require('./models/gallery');
const Account = require('./models/account');

const {WeAppServerApi} = require("./libs/weapp");
const ThirdUserAccount = require('./models/thirdAccount');
const matcher = require('micromatch');

const {Types} = require('mongoose')

let dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc');
const {sha256, sha512} = require("./utils/encryptUtils");
const path = require("path");
dayjs.extend(utc);

const serverApi = new WeAppServerApi({
  appId: config.WEAPP_APP_ID,
  appSecret: config.WEAPP_APP_SECRET
});

const chatConfiguration = new Configuration({
  apiKey: config.API_KEY,
  organization: config.ORG
})

fastify.register(require('./plugins/i18n'), {
  localesPath: path.join(__dirname, './locales'),
  defaultLocale: 'en'
});

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

fastify.register(cors, {
  origin: "*", // <- allow request from all domains
  methods: ["GET", "POST", "PUT", "DELETE", 'OPTIONS'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: 'Authorization'
});

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
fastify.get('/ping', function (req, res) {
  return this.t("PONG");
});

let msgSubscribers = {};

let headers = {
  "Access-Control-Allow-Origin": '*',
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
};
fastify.get("/msg-sub", (request, reply) => {

  reply.raw.writeHead(200, headers)
  setInterval(() => {
    reply.raw.write("data:ping\n\n");
  }, 10000)

  msgSubscribers[request.user.uid] = {
    reply,
    uid: request.user.uid,
    lastMsgId: 0,
    createAt: Date.now(),
    send(msg) {
      console.log("will send to ", this.uid);
      // this.reply.raw.writeHead(200, headers)
      reply.raw.write(`event:chat\ndata:${msg}\n\n`);
    }
  };
})

fastify.get('/', async (request, reply, next) => {
  let {text} = request.query;

  if (!text) {
    return;
  }

  // get today message quantity
  let msgCountToday = (await Message.aggregate([
    {
      $match: {
        from: new Types.ObjectId(request.user.uid),
      }
    },
    {
      $unwind: '$pool'
    },
    {
      $replaceRoot: {
        newRoot: "$pool"
      }
    },
    {
      $match: {
        'role': 'user',
        '$and': [
          {
            'createAt': {
              $gte: dayjs.utc().hour(0).minute(0).second(0).millisecond(0).valueOf(),
              $lte: dayjs.utc().hour(23).minute(59).second(59).millisecond(999).valueOf()
            }
          }
        ],
      }
    }
  ]).exec()).length;

  console.debug('send msg today ' + msgCountToday)
  if (msgCountToday > 50) {
    // beyond max daily msg send
    return "【系统】当日额度使用完，请提升额度活联系平台"
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
  }

  // append msg to repo
  messageRepo.pool.push(msg)
  await messageRepo.save()
  reply.send("success");

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
    msgSubscribers[request.user.uid].send(text);
  } catch (e) {
    msgSubscribers[request.user.uid].send("发生错误：" + e.message);

    return "error: " + e.message;
  }
})

// history chat msg
fastify.get('/chat', async (req, rep) => {
  let {start} = req.query;

  let filter = {};

  if (start) {
    filter['createAt'] = {
      $gte: dayjs(parseInt(start)).utc().valueOf()
    }
  } else {
    filter['createAt'] = {
      $gte: dayjs().subtract(1, 'day').utc().valueOf()
    }
  }

  const msg = await Message.aggregate([
    {
      $match: {
        from: new Types.ObjectId(req.user.uid),
      }
    },
    { $unwind: '$pool' },
    {
      $replaceRoot: {
        newRoot: "$pool"
      }
    },
    {
      $match: filter
    }
  ]);
  return msg ? msg : [];
})

fastify.post('/img', async (req, rep) => {
  const {desc} = req.body;
  if (!desc) {
    return;
  }

  let ret;
  try {
    ret = await openai.createImage({
      prompt: desc,
      n: 1,
      size: "1024x1024"
    });
  } catch (e) {
    console.log('==========================')
    console.log('create image error', e.response && e.response.data)
    console.log('==========================')
  }

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


fastify.post('/auth/common/login', async (req, rep) => {
  const {username, password} = req.body || {};
  if (!username || !password) {
    // throw exception for error with 403 status code
    throw new Error('username or password is empty')
  }

  let user = await User.findOne({username})
  if (!user) {
    throw new Error('username or password is wrong')
  }

  let isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('username or password is wrong')
  }

  // generate token
  let token = fastify.jwt.sign({
    uid: user._id,
  });

  return {
    token,
    expire: fastify.jwt.options.sign.expiresIn
  };

})

fastify.post('/auth/common/register', async (req, rep) => {
  const {username, password} = req.body || {};
  if (!username || !password) {
    throw new Error('username or password is empty')
  }
  // check if username is existed
  const user = await User.findOne({username});
  if (user) {
    throw new Error('username is existed');
  }

  let preparedUser = new User({
    username,
  });
  preparedUser.password = password;
  await preparedUser.save();
})


fastify.get("/dashboard/user", async (req, resp) => {
  return User.find({});
})

fastify.get("/dashboard/user/:id/chat", async (req, resp) => {
  let {id} = req.params;

  let filter = {
    from: new Types.ObjectId(id),
  };
  return Message.aggregate([
    {$match: filter},
    {$unwind: '$pool'},
    {
      $replaceRoot: {
        newRoot: "$pool"
      }
    }
  ]);
})

fastify.post('/dashboard/account/login', async (req, resp) => {
  const {username, password} = req.body;

  let storeAccount = await Account.findOne({username})

  if (!storeAccount) {
    resp.code(403);
    resp.send(fastify.t('USERNAME_PWD_INVALID'));
    return resp;
  }

  console.log('store account encrypt type', storeAccount.encryptType);

  // encrypt plain password by encrypt method
  let validPwd = storeAccount.encryptType === 'sha256' && sha256(password) === storeAccount.password;

  if (validPwd) {
    let token = fastify.jwt.sign({
      uid: storeAccount._id,
    })

    return {
      token,
      expireAt: fastify.jwt.options.sign.expiresIn * 1000 + Date.now()
    };
  }

  resp.statusCode = 403;
  resp.send(fastify.t('USERNAME_PWD_INVALID'));
})
