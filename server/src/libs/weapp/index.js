const request = require('teeny-request').teenyRequest;

const BASE_SERVER_URL = "https://api.weixin.qq.com";

const R = (options) => {
  request.defaults({
    timeout: 3000,
    headers: {
      'Content-Type': "application/json"
    },
  })
  options.uri && (options.uri = BASE_SERVER_URL + options.uri);

  return new Promise((resolve, reject) => {
    request(options, function (err, response, body) {
      if (err) {
        reject(err, body, response);
        return;
      }
      body = typeof body === "string" ? JSON.parse(body) : body;
      resolve(body, response);
    });
  })
}


class WeAppServerApi {
  #config = {
    appId: "",
    appSecret: "",
  };

  #accessToken = {
    value: "",
    createdAt: 0,
    expiresIn: 7200,
  }

  constructor(props) {
    const {appId, appSecret} = props;
    if (!appId || !appSecret) {
      throw new Error("appid or secret cannot null");
    }

    this.#config.appId = appId;
    this.#config.appSecret = appSecret;
  }

  async getAccessToken() {
    // check if expired
    if (!this.#accessToken.value || this.#accessToken.createdAt + this.#accessToken.expiresIn * 1000 > Date.now() - 1000 * 60) {

      console.info("[WeApp server api] Access Token is expired and get new one");

      let res = await R({
        uri: "/cgi-bin/token", method: "GET", qs: {
          grant_type: "client_credential",
          appid: this.#config.appId,
          secret: this.#config.appSecret,
        }
      });
      const {access_token, expires_in} = res;
      this.#accessToken.value = access_token;
      this.#accessToken.expiresIn = expires_in;
      this.#accessToken.createdAt = Date.now();
    }

    return this.#accessToken.value;
  }

  async code2session(code) {
    return R({uri: "/sns/jscode2session", method: "GET", qs: {
      appid: this.#config.appId,
      secret: this.#config.appSecret,
      js_code: code,
      grant_type: "authorization_code"
    }});
  }
}

module.exports = {
  WeAppServerApi,
}
const code2session = (appid, secret, js_code, grant_type) => {
  return R({uri: "/sns/jscode2session", method: "GET"});
};