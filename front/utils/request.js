const BASEURL = "http://127.0.0.1:3000";
export const GET = (url, data = {}, headers = {}) => {

  let token = wx.getStorageSync('token');
  if (token.content) {
    headers.Authorization = "Bearer " + token.content;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASEURL + url,
      method: "GET",
      data,
      header: headers,
      success(res) {
        resolve(res.data);
      },
      fail(res) {
        reject(res);
      }
    })
  })
}

export const POST = (url, data, headers = {}) => {
  return new Promise((resolve, reject) => {
    // set auth header

    let token = wx.getStorageSync('token');
    if (token.content) {
      headers.Authorization = "Bearer " + token.content;
    }

    wx.request({
      url: BASEURL + url,
      method: "POST",
      data,
      header: headers,
      success(res) {
        resolve(res.data);
      },
      fail(res) {
        reject(res);
      }
    })
  })
}