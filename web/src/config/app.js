let config = {
  development: {
    host: 'http://localhost:3000',
  },
  production: {
    host: 'https://chat.fastgo.vip',
  }
}

function initConfig(env) {
  console.log('env', env);
  if (!config[env]) {
    throw new Error("env property not determined");
  }

  let defaultConfig = {
    env: '',
    host: '',
  }
  return Object.assign({}, defaultConfig, config[env]);
}

export default initConfig(process.env.NODE_ENV || 'dev');