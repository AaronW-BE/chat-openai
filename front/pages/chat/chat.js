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

    wx.request({
      url: "https://chat.fastgo.vip",
      data: {
        text: this.data.inputText,
        uid: this.data.uid
      },
      success: res => {
        if (res.header.uid) {
          this.setData({
            uid: res.header.uid
          })
        }
        console.log(res);
        let _message = [...this.data.messages];
        _message.push({
          id: this.data.messages.length + 1,
          text: res.data.replaceAll("\n", "<br/>"),
          createTime: new Date(),
          self: false,
        })

        this.setData({
          messages: _message
        })
      }
    })

    this.setData({
      messages: _message,
      inputText: "",
    })
  },
});
