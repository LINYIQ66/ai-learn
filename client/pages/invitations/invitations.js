const api = require('../../utils/api');
Page({
  data: { invitations: [], loading: true },
  onShow() { this.loadList(); },
  async loadList() {
    this.setData({ loading: true });
    try { const data = await api.request('GET', '/api/invitation/list'); this.setData({ invitations: data || [], loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  },
  async join(e) {
    const id = e.currentTarget.dataset.id;
    try { await api.request('POST', '/api/invitation/join', { invitation_id: id }); wx.showToast({ title: '加入成功', icon: 'success' }); this.loadList(); }
    catch (e) {}
  }
});
