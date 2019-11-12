const app = getApp()
var graceRequest = require("../../graceUI/jsTools/request.js");
Page({
  data: {
    partys: [],
    graceFullLoading: false
  },
  onLoad: function (options) {
    this.yueinit()
  },
  onShow: function () {

  },
  godetail: function (e) {
    wx.navigateTo({
      url: '../detail/index?yueid=' + e.currentTarget.dataset.yueid
    })
  },
  onPullDownRefresh: function () {
    this.yueinit()
  },
  yueinit: function () {
    var _self = this;
    _self.setData({ graceFullLoading: true });
    graceRequest.get(
      'index/myhistory',
      { 'uid': wx.getStorageSync('SUID') },
      function (res) {
        _self.setData({
          partys: res.data
        })
        wx.stopPullDownRefresh();
        setTimeout(function () {
          _self.setData({ graceFullLoading: false });
        }.bind(_self), res.code);
      }
    );
  }
})