import {User} from "../../api/index";

Page({
  data: {
    showTipDialog: false,
  },
  onLoad: function (options) {
    User().then(result => {
      console.log('user: ', result);
    })
    this.data.showTipDialog && wx.showModal({
      title: "提示",
      content: "当前版本为体验版本，如有意见请使用反馈按钮向瓦力反馈",
      showCancel: false,
      confirmText: "知道了"
    })
  },
  onShareAppMessage() {

  },
});