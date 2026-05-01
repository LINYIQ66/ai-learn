const api = require('../../utils/api');
Page({
  data: { rankList: [], myRank: null, period: 'weekly', loading: true },
  onShow() { this.loadLeaderboard(); },
  async loadLeaderboard() {
    this.setData({ loading: true });
    try {
      const data = await api.request('GET', `/api/leaderboard?period=${this.data.period}`);
      this.setData({ rankList: data.list || data || [], loading: false });
    } catch (e) { this.setData({ loading: false }); }
  },
  switchPeriod(e) { const p = e.currentTarget.dataset.period; this.setData({ period: p }); this.loadLeaderboard(); },
  getMedal(idx) { return ['🥇','🥈','🥉'][idx] || idx + 1; }
});
