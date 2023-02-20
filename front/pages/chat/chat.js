Page({
  data: {
    inputText: "",
    messages: []
  },
  onLoad: function (options) {

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
      self: true,
      text: this.data.inputText,
      createTime: new Date(),
    })

    console.log('set messages')

    wx.request({
      url: "http://192.168.31.111:3000",
      data: {
        text: this.data.inputText,
      },
      success: res => {
        console.log(res);
        _message.push({
          text: res.data,
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
