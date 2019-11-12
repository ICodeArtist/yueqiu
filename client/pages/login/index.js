var graceChecker = require("../../graceUI/jsTools/graceChecker.js");
var graceRequest = require("../../graceUI/jsTools/request.js");
var _self,session_key, openid,pageoptions
Page({
  data: {
    pnpre: '86',
    pnpres: ['86', '01', '11', '26', '520'],
    vcodeBtnName: "获取验证码",
    countNum: 120,
    countDownTimer: null,
    phoneno: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canlogin:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _self = this;
    pageoptions = options;
    wx.login({
      success(res) {
        graceRequest.get(
          'index/codeToSession',
          { code: res.code },
          function (res) {
            var re = JSON.parse(res.data);
            session_key = re.session_key;
            openid = re.openid;
            if(res.code=='0'){
              _self.setData({
                canlogin: true
              })
            }
          }
        );
      }
    })
  },
  changePre: function (e) {
    this.setData({ pnpre: this.data.pnpres[e.detail.value] })
  },
  getVCode: function () {
    var myreg = /^[1][1,2,3,4,5,7,8,9][0-9]{9}$/;
    if (!myreg.test(this.data.phoneno)) {
      wx.showToast({ title: '请正确填写手机号码', icon: "none" });
      return false;
    }
    // 手机号码为 :  this.data.phoneno
    // vcodeBtnName 可以阻止按钮被多次点击 多次发送 return 会终止函数继续运行
    if (this.data.vcodeBtnName != '获取验证码' && this.data.vcodeBtnName != '重新发送') { return; }

    this.setData({ vcodeBtnName: "发送中..." });
    // 与后端 api 交互，发送验证码 【自己写的具体业务代码】
    // 假设发送成功，给用户提示
    wx.showToast({ title: '短信已发送，请注意查收', icon: "none" });
    // 倒计时
    this.setData({ countNum: 120 });
    this.setData({
      countDownTimer: setInterval(function () { this.countDown(); }.bind(this), 1000)
    });
  },
  countDown: function () {
    if (this.data.countNum < 1) {
      clearInterval(this.data.countDownTimer);
      this.setData({ vcodeBtnName: "重新发送" });
      return;
    }
    this.data.countNum--;
    this.setData({ countNum: this.data.countNum, vcodeBtnName: this.data.countNum + '秒重发' });
  },
  loginWithWx: function () {
    wx.showToast({
      title: '请完善对应登录代码',
      icon: "none"
    });
  },
  loginNow: function (e) {
    // 表单验证
    var rule = [
      { name: "pn", checkType: "phoneno", errorMsg: "请填写正确的手机号" },
      { name: "yzm", checkType: "string", checkRule: "4,6", errorMsg: "请正确填写短信验证码" },
    ];
    var formData = e.detail.value;
    var checkRes = graceChecker.check(formData, rule);
    if (checkRes) {
      wx.showToast({ title: "请观察控制台", icon: "none" });
    } else {
      wx.showToast({ title: graceChecker.error, icon: "none" });
    }
    console.log(e);
  },
  reg: function () {
    wx.showToast({ title: "注册页面类似登录，请自行完善 (:", icon: "none" });
  },
  phonenoInput: function (e) {
    this.setData({ phoneno: e.detail.value });
  },
  bindGetUserInfo(e) {
    var info = e.detail.userInfo;
    if (info == undefined){
      
    }else{
      graceRequest.post(
        'index/login',
        { 
          'openid': openid,
          'nickName': info.nickName,
          'avatarUrl': info.avatarUrl
        },
        'form',
        {},
        function (res) {
          if(res.code == '0'){
            wx.showToast({ title: "登录成功" });
            wx.setStorageSync('SUID', res.data.id);
            if (pageoptions.backtype == '1') {
              var param = pageoptions.param.split(',')
              wx.redirectTo({ url: pageoptions.backpage + '?' + param[0] + '=' + param[1] });
            } else {
              wx.switchTab({ url: pageoptions.backpage });
            }
          }
        }
      );
    }
    
  }
})