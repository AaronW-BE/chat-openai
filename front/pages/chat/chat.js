import {Chat, ChatHistory} from "../../api/chat";

Page({
  data: {
    inputText: "",
    messages: []
  },
  onLoad: function (options) {
    this.loadChatHistory();

    // wx.showModal({
    //   title: "提示",
    //   content: "为了防止资源滥用，每日发送上限为 50 条，如有更多需要请联系瓦力申请更多额度",
    //   showCancel: false
    // })

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
        text: res,
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
    let lastMsgDate = 0;
    let now = Date.now();
    let formattedMsgList = []
    let msgId = 0;
    msgList.map((msg) => {
      let sysMsg;
      let yesterdayMsg = now - msg.createAt > 24 * 60 * 60 * 1000;

      // 大于30分钟显示时间
      if (msg.createAt - lastMsgDate > 1000 * 60 * 30) {
        sysMsg = {
          id: ++msgId,
          type: 'sys',
          role: 'date',
          text: this.datetimeFormat(msg.createAt, yesterdayMsg)
        };

        lastMsgDate = msg.createAt;
        formattedMsgList.push(sysMsg);
      }

      formattedMsgList.push({
        id: ++msgId,
        self: msg.role === 'user',
        text: msg.content,
        createTime: new Date(msg.createAt),
      })
    })
    return formattedMsgList;
  },
  datetimeFormat(ts, full = false) {
    let date = new Date(ts);
    let str = "";
    if (full) {
      str = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} `;
    }
    str += `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    return str;
  },
});
