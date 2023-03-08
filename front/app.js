// app.js
import {Login} from "./api/auth";

App({
  onLaunch() {
    this.initAudioCtx();

    // TODO modify later
    this.auth();
  },
  // for login & get user token
  auth() {
    wx.checkSession({
      success: () => {
        let tokenObj = wx.getStorageSync('token');
        if (!tokenObj || tokenObj.expireAt > Date.now() - 200 * 1000) {
          this.handleAuth();
        }
      },
      fail: () => {
        this.handleAuth();
      }
    })
  },
  handleAuth() {
    wx.showLoading({
      mask: true,
      title: "登陆中"
    })
    wx.login({
      success: (res) => {
        if (res.code) {
          Login(res.code).then(response => {
            console.log('response', response);
            wx.setStorageSync('token', {
              content: response.token,
              expireAt: response.expire * 1000 + Date.now()
            })
          }).finally(() => {
            wx.hideLoading()
          });
        }
      },
      fail(res) {
        wx.hideLoading();
      }
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
