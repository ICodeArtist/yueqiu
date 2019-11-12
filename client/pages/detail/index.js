const app = getApp()
var graceRequest = require("../../graceUI/jsTools/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yueid: "",
    yueinfo: {},
    join: []//加入的人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var loginRes = app.checkLogin('../detail/index', '1', 'yueid,' + options.yueid);
    if (!loginRes) { return false; }
    this.setData({
      yueid: options.yueid
    })
    this.yueinfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  goz: function(e){
    var _self = this;
    graceRequest.post(
      'index/zyuejoin',
      {
        'uid': wx.getStorageSync('SUID'),
        'yuejoinid': e.currentTarget.dataset.id
      },
      'form',
      {},
      function (res) {
        if (res.code == '0') {
          _self.yueinfo()
        } else {
          wx.showToast({
            title: res.msg,
            icon: "none"
          })
        }
      }
    );
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // onUnload: function () {
  //   wx.reLaunch({
  //     url: '../index/index'
  //   })
  // },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const _this = this
    return {
      title: '我获得了荣誉',
      desc: '',
      path: 'pages/detail/index?yueid=' + _this.data.yueid,
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        // 分享失败
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    }
  },
  yueinfo: function () {
    var _self = this;
    // _self.setData({ graceFullLoading: true });
    graceRequest.get(
      'index/logyueinfo',
      {
        'yueid': _self.data.yueid ,
        'uid': wx.getStorageSync('SUID')
      },
      function (res) {
        _self.setData({
          yueinfo: res.data.yueinfo,
          join: res.data.join
        })
      }
    );
  }
})  