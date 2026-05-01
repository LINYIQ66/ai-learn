// app.js
App({
  globalData: {
    token: '',
    userInfo: null,
    serverUrl: 'https://ai.happysocial.xyz',
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  setToken(token) {
    this.globalData.token = token;
    wx.setStorageSync('token', token);
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  logout() {
    this.globalData.token = '';
    this.globalData.userInfo = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
  },

  // 获取问候语
  getGreeting() {
    const h = new Date().getHours();
    if (h < 6) return '🌙 夜深了还在学习，真努力！';
    if (h < 9) return '🌅 早安，开启元气满满的一天！';
    if (h < 12) return '☀️ 上午好，一起来学 AI 吧';
    if (h < 14) return '🌤 中午好，休息一下继续学';
    if (h < 18) return '📚 下午好，今天学了多少？';
    if (h < 21) return '🌆 傍晚好，趁天黑前再学一课';
    return '🌙 晚上好，安静学习正当时';
  }
});
