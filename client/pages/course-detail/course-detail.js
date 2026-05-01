// pages/course-detail/course-detail.js
const app = getApp();

Page({
  data: {
    course: null,
    lessons: [],
    loading: true,
    error: '',
    completedCount: 0,
    totalCount: 0,
    progressPercent: 0,
  },

  onLoad(options) {
    const courseId = options.id;
    if (!courseId) {
      this.setData({ loading: false, error: '缺少课程ID' });
      return;
    }
    this.courseId = courseId;
    this.loadCourse(courseId);
  },

  onShow() {
    // 从课程页面返回时刷新进度
    if (this.courseId) {
      this.loadCourse(this.courseId);
    }
  },

  loadCourse(courseId) {
    const that = this;
    this.setData({ loading: true, error: '' });

    wx.request({
      url: app.globalData.serverUrl + '/api/course/detail/' + courseId,
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.token,
        'Content-Type': 'application/json',
      },
      success(res) {
        if (res.statusCode === 200 && res.data.code === 0) {
          const course = res.data.data;
          const lessons = course.lessons || [];

          const completedCount = lessons.filter(l => l.completed).length;
          const totalCount = lessons.length;
          const progressPercent = totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;

          that.setData({
            course: course,
            lessons: lessons,
            loading: false,
            completedCount: completedCount,
            totalCount: totalCount,
            progressPercent: progressPercent,
          });
        } else {
          that.setData({
            loading: false,
            error: res.data.msg || '加载课程失败',
          });
        }
      },
      fail() {
        that.setData({
          loading: false,
          error: '网络请求失败，请检查网络',
        });
      },
    });
  },

  goLesson(e) {
    const lessonId = e.currentTarget.dataset.lessonId;
    const courseId = e.currentTarget.dataset.courseId;
    if (!lessonId) return;

    wx.navigateTo({
      url: '/pages/lesson/lesson?lessonId=' + lessonId + '&courseId=' + courseId,
    });
  },

  // 计算得分颜色
  getScoreClass(score) {
    if (score == null) return '';
    if (score >= 90) return 'score-high';
    if (score >= 60) return 'score-mid';
    return 'score-low';
  },

  // 计算分类标签样式
  getCategoryClass(category) {
    if (!category) return '';
    const cat = category.toLowerCase();
    if (cat.includes('beginner') || cat.includes('初级') || cat.includes('入门')) return 'tag-beginner';
    if (cat.includes('intermediate') || cat.includes('中级') || cat.includes('进阶')) return 'tag-intermediate';
    if (cat.includes('advanced') || cat.includes('高级')) return 'tag-advanced';
    return '';
  },
});
