// app.js
App({
  onLaunch() {
    this.initAudioCtx();
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
  data: {
    userInfo: null,
    uid: '',
    audioCtx: null
  }
})
