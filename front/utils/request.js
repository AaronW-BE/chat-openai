const BASEURL = "http://127.0.0.1:3000";

let MAX_FAIL_RETRY_COUNT = 3;
let failCount = 0;

export const R = (url, method, query = {}, data = {}, headers = {}) => {
  let token = wx.getStorageSync('token');
  if (token.content) {
    headers.Authorization = "Bearer " + token.content;
  }

  if (method.toUpperCase() === "GET") {
    data = query;
  }

  return new Promise((resolve, reject) => {
    if (failCount >= MAX_FAIL_RETRY_COUNT) {
      reject("retry overflow");
      return;
    }
    wx.request({
      url: BASEURL + url,
      method,
      data,
      header: headers,
      async success(res) {
        if (res.statusCode === 401) {
          failCount++;
          let app = getApp();
          await app.handleAuth();

          // resend
          await R(url, method, query, data, headers);
        }
        resolve(res.data);
      },
      fail(res) {
        reject(res);
      }
    });
  })
}

export const GET = (url, data = {}, headers = {}) => {
  return R(url, "GET", data, {}, headers);
}

export const POST = (url, data, headers = {}) => {
  return R(url, "POST", data, {}, headers);
}