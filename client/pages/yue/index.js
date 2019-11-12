var graceChecker = require("../../graceUI/jsTools/graceChecker.js");
var graceRequest = require("../../graceUI/jsTools/request.js");
const app = getApp()
Page({
  data: {
    numIndex: 0,
    num: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    dateValue: "请选择",
    timeValue:"请选择",
    palce:"",
    latitude:"",
    longitude:"",
    ifpay:"0",
    numberVal:"",
    graceFullLoading: false,
    graceNumberKeyboardShow: false,
  },
  onLoad: function (options) {
    
  },
  bindPickerChange: function (e) {
    this.setData({numIndex : e.detail.value});
  },
  bindDateChange: function (e) {
    this.setData({ dateValue: e.detail.value });
  },
  bindTimeChange: function (e) {
    this.setData({ timeValue: e.detail.value });
  },
  bindPlaceChange: function (e) {
    const _self = this;
    wx.chooseLocation({
      success(res) {
        _self.setData({ 
          palce: res.name,
          latitude: res.latitude,
          longitude: res.longitude
        });
      }
    })
  },
  bindPayChange: function (e) {
    let ifpay = e.detail.value==true?'1':'0'
    this.setData({ ifpay: ifpay });
  },
  formSubmit: function (e) {
    var _self = this;
    
    //定义表单规则
    var rule = [
      { name: "title", checkType: "notnull", checkRule: "", errorMsg: "标题不能为空" },
      { name: "bd", checkType: "notsame", checkRule: "请选择", errorMsg: "请选择运动日期" },
      { name: "bt", checkType: "notsame", checkRule: "请选择", errorMsg: "请选择运动时间" },
      { name: "place", checkType: "notnull", checkRule: "", errorMsg: "请选择打球地点" },
    ];
    //进行表单检查
    var formData = e.detail.value;
    var checkRes = graceChecker.check(formData, rule);
    //进行金额检查
    var reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
    if (this.data.ifpay == 1 && (!reg.test(this.data.numberVal) || this.data.numberVal<=0)) {
      wx.showToast({
        title: "请输入正确的金额",
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (checkRes) {

      const data = e.detail.value;
      data.uid = wx.getStorageSync('SUID');
      data.latitude = this.data.latitude;
      data.longitude = this.data.longitude;
      data.ifpay = this.data.ifpay;

      _self.setData({ graceFullLoading: true });
      graceRequest.post(
        'index/buildyue',
        data,
        'form',
        {},
        function (res) {
          _self.setData({ graceFullLoading: false });
          if(res.code == '0'){
            wx.navigateTo({
              url: '../join/index?yueid=' + res.data
            })
          }else{
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 1000
            })
          }
         
        }
      );
    } else {
      wx.showToast({ title: graceChecker.error, icon: "none" });
      _self.setData({ graceFullLoading: false });
    }
  },
  //打开数字键盘
  showKeyboard: function () {
    this.setData({ graceNumberKeyboardShow: true });
  },
  // 监听输入
  keyboardInput: function (e) {
    this.setData({ numberVal: this.data.numberVal + '' + e.detail });
  },
  // 监听删除
  keyboardDelete: function () {
    this.setData({ numberVal: this.data.numberVal.substring(0, this.data.numberVal.length - 1) });
  },
  // 完成事件
  keyboardDone: function () {
    this.setData({ graceNumberKeyboardShow: false });
  }
})