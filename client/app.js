//app.js
App({
  onLaunch: function () {
    
  },
  checkLogin: function (backpage, backtype, param){
    var SUID = wx.getStorageSync('SUID');
    if (SUID == '' || SUID == undefined) {
      wx.redirectTo({
        url: '../login/index?backpage=' + backpage + '&backtype=' + backtype + '&param=' + param
      });
      return false;
    }
    return [SUID];
  }
})