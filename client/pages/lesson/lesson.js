const api = require('../../utils/api');
Page({
  data: { lesson: null, courseId: null, lessonId: null, loading: true },
  onLoad(options) { this.setData({ courseId: options.courseId, lessonId: options.lessonId }); this.loadLesson(); },
  async loadLesson() {
    try { const data = await api.request('GET', `/api/lesson/detail/${this.data.lessonId}`); this.setData({ lesson: data, loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  },
  async doComplete() {
    try {
      const data = await api.request('POST', '/api/lesson/complete', { lesson_id: parseInt(this.data.lessonId) });
      wx.showToast({ title: `+${data.points_awarded || 10}积分`, icon: 'success' });
      setTimeout(() => wx.navigateTo({ url: `/pages/quiz/quiz?lessonId=${this.data.lessonId}&courseId=${this.data.courseId}` }), 1000);
    } catch (e) {}
  },
  goQuiz() { wx.navigateTo({ url: `/pages/quiz/quiz?lessonId=${this.data.lessonId}&courseId=${this.data.courseId}` }); }
});
