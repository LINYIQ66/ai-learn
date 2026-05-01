const api = require('../../utils/api');
Page({
  data: { rewards: [], loading: true },
  onLoad() { this.loadRewards(); },
  async loadRewards() {
    try { const data = await api.request('GET', '/api/rewards/list'); this.setData({ rewards: data || [], loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  },
  async claim(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({ title: '确认兑换', content: '确定要兑换这个奖励吗？', success: async (res) => {
      if (!res.confirm) return;
      try { await api.request('POST', '/api/rewards/claim', { reward_id: id }); wx.showToast({ title: '兑换成功', icon: 'success' }); this.loadRewards(); }
      catch (e) {}
    }});
  }
});
