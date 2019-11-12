// pages/my/index.js
const app = getApp()
var graceRequest = require("../../graceUI/jsTools/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:{},
    level:'1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _self = this;
    graceRequest.get(
      'index/myinfo',
      { 'uid': wx.getStorageSync('SUID') },
      function (res) {
        _self.setData({
          user: res.data,
          level:res.data.level
        })
      }
    );
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  }
})