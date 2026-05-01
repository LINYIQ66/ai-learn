const api = require('../../utils/api');
Page({
  data: { quizzes: [], answers: {}, lessonId: null, courseId: null, loading: true, submitted: false, result: null },
  onLoad(options) { this.setData({ lessonId: options.lessonId, courseId: options.courseId }); this.loadQuizzes(); },
  async loadQuizzes() {
    try { const data = await api.request('GET', `/api/quiz/list/${this.data.lessonId}`); this.setData({ quizzes: data || [], loading: false }); }
    catch (e) { this.setData({ loading: false }); }
  },
  selectAnswer(e) {
    if (this.data.submitted) return;
    const { quizId, answer } = e.currentTarget.dataset;
    const answers = { ...this.data.answers, [quizId]: answer };
    this.setData({ answers });
  },
  async submitAnswers() {
    const answers = Object.entries(this.data.answers).map(([quiz_id, answer]) => ({ quiz_id: parseInt(quiz_id), answer }));
    if (answers.length === 0) { wx.showToast({ title: '请先答题', icon: 'none' }); return; }
    try {
      const data = await api.request('POST', '/api/quiz/submit', { lesson_id: parseInt(this.data.lessonId), answers });
      this.setData({ submitted: true, result: data });
    } catch (e) {}
  },
  goBack() { wx.navigateBack(); },
  getOptionLabel(idx) { return String.fromCharCode(65 + idx); }
});
