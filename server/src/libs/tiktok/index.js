const crypto= require("crypto");
const {sha1} = require("../../utils/encryptUtils");
const request = require('teeny-request').teenyRequest;

const BASE_SERVER_URL = "https://developer.toutiao.com";

const R = (options) => {
    request.defaults({
        timeout: 3000,
        headers: {
            "content-type": "application/json"
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


class TiktokServerApi {
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

            console.info("[Tiktok server api] Access Token is expired and get new one");

            let res = await R({
                uri: "/api/apps/v2/token", method: "POST", qs: {
                    appid: this.#config.appId,
                    secret: this.#config.appSecret,
                    grant_type: "client_credential",
                }
            });
            const {access_token, expires_in} = res;
            this.#accessToken.value = access_token;
            this.#accessToken.expiresIn = expires_in;
            this.#accessToken.createdAt = Date.now();
        }

        return this.#accessToken.value;
    }

    async code2session(code, anonymous_code = "") {
        let ret = await R({uri: "/api/apps/v2/jscode2session", method: "POST", json: {
                appid: this.#config.appId,
                secret: this.#config.appSecret,
                code,
                anonymous_code
            }});
        return ret.err_no === 0 ? ret.data : null;
    }

    getSignature(rawData, sessionKey) {
        return sha1(rawData + sessionKey)
    }

    decryptData(encryptedData, sessionKey, iv) {
        console.log(sessionKey, iv)
        const decipher = crypto.createDecipheriv(
            "aes-128-cbc",
            Buffer.from(sessionKey, "base64"),
            Buffer.from(iv, "base64")
        );
        let ret = decipher.update(encryptedData, "base64");
        ret += decipher.final();
        return ret;
    }
}

module.exports = {
    TiktokServerApi,
}
