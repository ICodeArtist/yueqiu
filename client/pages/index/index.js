const app = getApp()
var graceRequest = require("../../graceUI/jsTools/request.js");
Page({
  data: {
    partys:[],
    graceFullLoading: false
  },
  onLoad: function (options) {
    var loginRes = app.checkLogin('../index/index', '2');
    if (!loginRes) { return false; }
    this.yueinit()
  },
  onShow: function(){
    
  },
  tojoin: function(e){
    wx.navigateTo({
      url: '../join/index?yueid=' + e.target.dataset.yueid
    })
  },
  cancel: function (e) {
    var _self = this;
    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success(res) {
        if (res.confirm) {
          _self.setData({ graceFullLoading: true });
          graceRequest.get(
            'index/delyue',
            { 'yueid': e.target.dataset.yueid },
            function (res) {
              _self.setData({ graceFullLoading: false });
              _self.yueinit()
            }
          );
        } else if (res.cancel) {
          
        }
      }
    })
    
  },
  onPullDownRefresh: function () {
    this.yueinit()
  },
  yueinit: function(){
    var _self = this;
    _self.setData({ graceFullLoading: true });
    graceRequest.get(
      'index/myyue',
      { 'uid': wx.getStorageSync('SUID') },
      function (res) {
        _self.setData({
          partys: res.data
        })
        wx.stopPullDownRefresh();
        setTimeout(function () { 
          _self.setData({ graceFullLoading: false }); 
        }.bind(_self), res.code);
        // _self.setData({ graceFullLoading: false });
      }
    );
  }
})