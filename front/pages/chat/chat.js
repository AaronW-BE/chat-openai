import {Chat} from "../../api/chat";

Page({
  data: {
    inputText: "",
    uid: "",
    messages: []
  },
  onLoad: function (options) {
    let uid = wx.getStorageSync('uid') || '';
    this.setData({
      uid
    })

  },
  handleInput(e) {
    this.setData({
      inputText: e.detail.value
    })
  },
  bindSend(e) {
    if (!this.data.inputText) {
      return;
    }


    let _message = [...this.data.messages];

    _message.push({
      id: this.data.messages.length + 1,
      self: true,
      text: this.data.inputText,
      createTime: new Date(),
    })

    console.log('set messages')

    Chat(this.data.inputText).then(res => {
      // play audio
      getApp().config.playSound && getApp().data.audioCtx.play();

      let _message = [...this.data.messages];
      _message.push({
        id: this.data.messages.length + 1,
        text: res.trim().replaceAll("\n", "<br/>"),
        createTime: new Date(),
        self: false,
      })

      this.setData({
        messages: _message
      })
    })

    this.setData({
      messages: _message,
      inputText: "",
    })
  },
});
