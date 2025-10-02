// pages/splash/splash.js
Page({
  data: {
    
  },

  onLoad() {
    // 2秒后自动跳转到首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/home/home'
      });
    }, 2000);
  }
})
