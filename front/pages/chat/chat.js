Page({
  data: {
    inputText: "",
    messages: []
  },
  onLoad: function (options) {

  },
  handleInput(e) {
    if (this.data.inputText !== e.detail.value) {
      this.setData({
        inputText: e.detail.value
      })
    }
  },
  bindSend(e) {
    console.log(this.data.inputText)
    let _message = [...this.data.messages];

    _message.push({
      self: true,
      text: this.data.inputText,
      createTime: new Date(),
    })

    console.log('set messages')

    wx.request({
      url: "http://127.0.0.1:3000",
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