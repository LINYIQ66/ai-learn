const api = require('../../utils/api');
Page({
  data: { messages: [], loading: true },
  onShow() { this.loadMessages(); },
  async loadMessages() {
    this.setData({ loading: true });
    try { const data = await api.request('GET', '/api/message/list'); this.setData({ messages: data || [], loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  }
});
