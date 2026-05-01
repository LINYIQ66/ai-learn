module.exports = {
  DB: {
    host: '127.0.0.1',
    user: 'debian-sys-maint',
    password: '7kWuvHW9ve0Zexc5',
    database: 'ai_learn',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  JWT_SECRET: 'ai_learn_jwt_2024_secret',
  PORT: 3001,
  WX: {
    appid: 'wx4afb3e5f7d1f4bab',
    secret: '32a7f81437e67a01b49fcb555491b5d0'
  },
  POINTS: {
    STREAK_BASE: 5,
    STREAK_MAX: 15,
    LESSON_COMPLETE: 10,
    QUIZ_PERFECT_BONUS: 5,
    QUIZ_CORRECT: 2
  },
  UPLOAD_DIR: '/var/www/learn/uploads'
};
