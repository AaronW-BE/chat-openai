// app.js
import {Login} from "./api/auth";

App({
  onLaunch() {
    this.initAudioCtx();

    // TODO modify later
    this.auth();

    this.checkUpdate();
  },
  checkUpdate() {
    let um = wx.getUpdateManager()
    um.onUpdateReady(function () {
      wx.showModal({
        title: "更新提示",
        content: "新版本已准备好，是否重启以更新",
        success(res) {
          if (res.confirm) {
            um.applyUpdate();
          }
        }
      })
    });
  },
  // for login & get user token
  auth() {
    wx.checkSession({
      success: async () => {
        let tokenObj = wx.getStorageSync('token');
        if (!tokenObj || tokenObj.expireAt > Date.now() - 200 * 1000) {
          await this.handleAuth();
        }
      },
      fail: async () => {
        await this.handleAuth();
      }
    })
  },
  handleAuth() {
    wx.showLoading({
      mask: true,
      title: "登陆中"
    })
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            Login(res.code).then(response => {
              wx.setStorageSync('token', {
                content: response.token,
                expireAt: response.expire * 1000 + Date.now()
              })
              resolve();
            }).finally(() => {
              wx.hideLoading()
            });
          }
        },
        fail(res) {
          wx.hideLoading();
          reject();
        }
      })
    })

  },
  initAudioCtx() {
    let audioCtx = wx.createInnerAudioContext({
      useWebAudioImplement: false
    })
    audioCtx.src = "/assets/audio/13654.wav";
    audioCtx.startTime = 0;
    audioCtx.title = "chat";
    this.data.audioCtx = audioCtx;
  },
  config: {
    playSound: true
  },
  data: {
    userInfo: null,
    uid: '',
    audioCtx: null
  }
})
