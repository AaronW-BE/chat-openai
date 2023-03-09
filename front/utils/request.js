const BASEURL = "http://127.0.0.1:3000";

export const R = (url, method, query = {}, data = {}, headers = {}) => {
  let token = wx.getStorageSync('token');
  if (token.content) {
    headers.Authorization = "Bearer " + token.content;
  }

  if (method.toUpperCase() === "GET") {
    data = query;
  }

  let MAX_FAIL_RETRY_COUNT = 3;
  let failCount = 0;
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASEURL + url,
      method,
      data,
      header: headers,
      async success(res) {
        if (res.statusCode === 401) {
          if (failCount < MAX_FAIL_RETRY_COUNT) {
            failCount++;
          } else {
            console.warn("beyond max retry times");
            reject(res.data);
          }

          let app = getApp();
          await app.auth();

          // resend
          await R(url, method, query, data, headers);
        }
        resolve(res.data);
      },
      fail(res) {
        reject(res);
      }
    })
  })
}

export const GET = (url, data = {}, headers = {}) => {
  return R(url, "GET", data, {}, headers);
}

export const POST = (url, data, headers = {}) => {
  return R(url, "POST", data, {}, headers);
}