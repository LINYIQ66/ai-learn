const api = require('../../utils/api');
const app = getApp();
Page({
  data: { userInfo: null, points: 0, level: 1, streakDays: 0 },
  onShow() {
    if (!app.globalData.token) {
      api.checkLogin().then(() => this.loadProfile());
    } else { this.loadProfile(); }
  },
  async loadProfile() {
    try { const data = await api.request('GET', '/api/auth/profile'); this.setData({ userInfo: data, points: data.points, level: data.level, streakDays: data.streak_days }); }
    catch (e) {}
  },
  goPoints() { wx.navigateTo({ url: '/pages/points/points' }); },
  goRewards() { wx.navigateTo({ url: '/pages/rewards/rewards' }); },
  goInvitations() { wx.navigateTo({ url: '/pages/invitations/invitations' }); },
  goMessages() { wx.navigateTo({ url: '/pages/messages/messages' }); }
});
