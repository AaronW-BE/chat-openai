Page({
  data: {
    searchText: "",
    generating: false,
  },
  onLoad: function (options) {

  },
  handleInput(e) {
    this.setData({
      searchText: e.detail.value,
    })
  },
  handleGenerate() {
    this.setData({
      generating: !this.data.generating
    })
  },
});