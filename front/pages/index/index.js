import {User} from "../../api/index";

Page({
  data: {},
  onLoad: function (options) {
    User().then(result => {
      console.log('user: ', result);
    })
  }
});