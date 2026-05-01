const api = require('../../utils/api');
Page({
  data: { logs: [], loading: true },
  onLoad() { this.loadLogs(); },
  async loadLogs() {
    try { const data = await api.request('GET', '/api/points/history'); this.setData({ logs: data || [], loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  }
});
