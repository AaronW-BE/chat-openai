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
      id: this.data.messages.length + 1,
      self: true,
      text: this.data.inputText,
      createTime: new Date(),
    })

    console.log('set messages')

    wx.request({
      url: "127.0.0.1:3000",
      data: {
        text: this.data.inputText,
      },
      success: res => {
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
