import {Chat, ChatHistory} from "../../api/chat";

Page({
  data: {
    inputText: "",
    messages: []
  },
  onLoad: function (options) {
    wx.showModal({
      title: "提示",
      content: "为了防止资源滥用，每日发送上限为 50 条，如有更多需要请联系瓦力申请更多额度",
      showCancel: false
    })

    this.loadChatHistory();
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

  loadChatHistory() {
    let startDate = new Date()
    startDate.setDate(new Date().getDate() - 1)
    ChatHistory(startDate.getTime()).then(result => {
      if (result.length) {
        this.setData({
          messages: this.formatMsg(result)
        })
      }
    })
  },
  formatMsg(msgList) {
    return msgList.map((msg, idx) => ({
      id: idx + 1,
      self: msg.role === 'user',
      text: msg.content,
      createTime: new Date(msg.createAt),
    }))
  }
});
