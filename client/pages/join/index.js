const app = getApp()
var graceRequest = require("../../graceUI/jsTools/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    popmenuShow: true,
    yueid:"",
    longitude:"",//地图中心
    latitude:"",
    markers: [],//标记
    yueinfo:{},
    join:[]//加入的人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var loginRes = app.checkLogin('../join/index', '1', 'yueid,' + options.yueid);
    if (!loginRes) { return false; }
    this.setData({
      yueid:options.yueid
    })
    this.yueinfo()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  showmenu: function () {
    this.setData({ popmenuShow: !this.data.popmenuShow });
  },
  showhome: function () {
    wx.switchTab({ url: '../index/index'});
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const _this = this
    var shareObj = {
      title: '一起约球',
      desc: '',
      path: 'pages/join/index?yueid=' + _this.data.yueid,//这是一个路径
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        console.log(res)
        // 分享失败
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    }

    return shareObj;
  },
  markertap(e) {
    // console.log(e.markerId)
  },
  yueinfo: function () {
    var _self = this;
    graceRequest.get(
      'index/yueinfo',
      { 'yueid': this.data.yueid },
      function (res) {
        _self.setData({
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          markers: res.data.markers,
          yueinfo: res.data.yueinfo,
          join: res.data.join
        })
      }
    );
  },
  go: function(e){
    var _self = this
    var jparam = {}
    jparam.yueid = e.target.dataset.yueid

    if (this.data.yueinfo.ifpay == '1' && wx.getStorageSync('SUID') == '1'){
      wx.showLoading({
        title: '加载中',
        mask:true
      })
      graceRequest.post(
        'index/joinpay',
        {
          'uid': wx.getStorageSync('SUID'),
          'yueid': jparam.yueid
        },
        'form',
        {},
        function (res) {
          wx.hideLoading()
          if (res.status == 'yes') {
            delete res.status
            delete res.appId
            res.success = function(e){
              _self.yuejoin(jparam)
            }
            res.fail = function (e) {
              
            }
            wx.requestPayment(res)
          } else {
            wx.showToast({
              title: res.msg,
              icon: "none"
            })
          }
        }
      ); 
    }else{
      _self.yuejoin(jparam)
    }
  },
  yuejoin: function (jparam){
    var _self = this;
    graceRequest.post(
      'index/joinyue',
      {
        'uid': wx.getStorageSync('SUID'),
        'yueid': jparam.yueid
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
  }
})  