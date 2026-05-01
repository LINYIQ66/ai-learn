const api = require('../../utils/api');
const app = getApp();

Page({
  data: { courses: [], greeting: '', userInfo: null, points: 0, loading: true, signedToday: false },

  onLoad() { this.setData({ greeting: app.getGreeting() }); },

  onShow() {
    if (app.globalData.token) {
      this.setData({ userInfo: app.globalData.userInfo, points: app.globalData.userInfo?.points || 0 });
      this.loadCourses();
    } else {
      api.checkLogin().then(() => {
        this.setData({ userInfo: app.globalData.userInfo, points: app.globalData.userInfo?.points || 0 });
        this.loadCourses();
      });
    }
  },

  async onPullDownRefresh() { await this.loadCourses(); wx.stopPullDownRefresh(); },

  async loadCourses() {
    this.setData({ loading: true });
    try { const data = await api.request('GET', '/api/course/list'); this.setData({ courses: data || [], loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  },

  goCourseDetail(e) { wx.navigateTo({ url: `/pages/course-detail/course-detail?id=${e.currentTarget.dataset.id}` }); },
  goProfile() { wx.switchTab({ url: '/pages/profile/profile' }); },
  goLeaderboard() { wx.switchTab({ url: '/pages/leaderboard/leaderboard' }); },

  async doSignin() {
    try {
      const data = await api.request('POST', '/api/points/signin');
      this.setData({ signedToday: true, points: (this.data.points || 0) + (data.points || 5) });
      wx.showToast({ title: `+${data.points || 5}积分`, icon: 'success' });
    } catch (e) {}
  },

  getCategoryTag(cat) { return { beginner: '入门', intermediate: '进阶', advanced: '高级' }[cat] || cat || '入门'; },
  getCoverEmoji(id) { return ['📖','📊','🧠','🤖','💬','🔍','🎯','⚡','🌟','💻'][id % 10]; }
});
