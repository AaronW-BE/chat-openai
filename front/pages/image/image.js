import {GenImage} from "../../api/index";

Page({
  data: {
    searchText: "",
    generating: false,
    imageList: [],
  },
  onLoad: function (options) {

  },
  handleInputText(e) {
    this.setData({
      searchText: e.detail.value,
    })
  },
  handleGenerate() {
    console.log("search for ", this.data.searchText);
    if (!this.data.searchText) {
      return;
    }
    this.setData({
      generating: true,
      imageList: []
    });

    GenImage(this.data.searchText).then(result => {
      this.setData({
        imageList: result,
        generating: false
      })
    });
  },
  handleDL(e) {
    let url = e.currentTarget.dataset.url;
    wx.downloadFile({
      url,
      success(res) {
        console.log(res)
      },
      fail(res) {
        console.log(res)
      }
    })
  },
});