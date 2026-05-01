const express = require('express');
const router = express.Router();
const pool = require('./db');
const config = require('./config');
const auth = require('./auth');

// All routes need auth
router.use(auth);

// GET /api/course/list - list all active courses with progress for current user
router.get('/course/list', async (req, res) => {
  try {
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE status = 1 ORDER BY sort_order ASC'
    );

    // Get progress for each course
    const result = [];
    for (const course of courses) {
      const [lessons] = await pool.query('SELECT COUNT(*) as total FROM lessons WHERE course_id = ?', [course.id]);
      const [completed] = await pool.query(
        'SELECT COUNT(*) as done FROM user_lessons WHERE user_id = ? AND course_id = ? AND completed = 1',
        [req.userId, course.id]
      );
      result.push({
        ...course,
        total_lessons: lessons[0].total,
        completed_lessons: completed[0].done
      });
    }

    res.json({ code: 0, data: result, msg: 'success' });
  } catch (err) {
    console.error('Course list error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/course/detail/:id - course detail with lesson list and user progress
router.get('/course/detail/:id', async (req, res) => {
  try {
    const [courses] = await pool.query('SELECT * FROM courses WHERE id = ?', [req.params.id]);
    if (courses.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Course not found' });
    }

    const [lessons] = await pool.query(
      'SELECT id, course_id, title, summary, duration, sort_order, created_at FROM lessons WHERE course_id = ? ORDER BY sort_order ASC',
      [req.params.id]
    );

    // Get user progress for each lesson
    const lessonList = [];
    for (const lesson of lessons) {
      const [progress] = await pool.query(
        'SELECT completed, score, completed_at FROM user_lessons WHERE user_id = ? AND lesson_id = ?',
        [req.userId, lesson.id]
      );
      lessonList.push({
        ...lesson,
        completed: progress.length > 0 ? progress[0].completed : 0,
        score: progress.length > 0 ? progress[0].score : null,
        completed_at: progress.length > 0 ? progress[0].completed_at : null
      });
    }

    const course = courses[0];
    res.json({
      code: 0,
      data: {
        ...course,
        lessons: lessonList
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Course detail error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/lesson/detail/:id - lesson content (markdown)
router.get('/lesson/detail/:id', async (req, res) => {
  try {
    const [lessons] = await pool.query('SELECT * FROM lessons WHERE id = ?', [req.params.id]);
    if (lessons.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Lesson not found' });
    }
    res.json({ code: 0, data: lessons[0], msg: 'success' });
  } catch (err) {
    console.error('Lesson detail error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/lesson/complete - mark lesson as complete
router.post('/lesson/complete', async (req, res) => {
  try {
    const { lesson_id } = req.body;
    if (!lesson_id) {
      return res.status(400).json({ code: 400, msg: 'Missing lesson_id' });
    }

    // Get lesson info
    const [lessons] = await pool.query('SELECT id, course_id FROM lessons WHERE id = ?', [lesson_id]);
    if (lessons.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Lesson not found' });
    }
    const lesson = lessons[0];

    // Check if already completed
    const [existing] = await pool.query(
      'SELECT id FROM user_lessons WHERE user_id = ? AND lesson_id = ?',
      [req.userId, lesson_id]
    );

    if (existing.length > 0) {
      // Already completed, just return
      return res.json({ code: 0, data: { already_completed: true }, msg: 'Lesson already completed' });
    }

    // Insert completion record
    await pool.query(
      'INSERT INTO user_lessons (user_id, course_id, lesson_id, completed, completed_at) VALUES (?, ?, ?, 1, NOW())',
      [req.userId, lesson.course_id, lesson_id]
    );

    // Award points
    const pointsAwarded = config.POINTS.LESSON_COMPLETE;
    await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [pointsAwarded, req.userId]);

    // Record point transaction
    await pool.query(
      'INSERT INTO points_log (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [req.userId, pointsAwarded, 'lesson_complete', `完成课程学习 +${pointsAwarded}积分`]
    );

    res.json({
      code: 0,
      data: { points_awarded: pointsAwarded, already_completed: false },
      msg: 'success'
    });
  } catch (err) {
    console.error('Lesson complete error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/quiz/list/:lesson_id - get quizzes for a lesson
router.get('/quiz/list/:lesson_id', async (req, res) => {
  try {
    const [quizzes] = await pool.query(
      'SELECT id, lesson_id, question, options, points, sort_order FROM quizzes WHERE lesson_id = ? ORDER BY sort_order ASC',
      [req.params.lesson_id]
    );
    res.json({ code: 0, data: quizzes, msg: 'success' });
  } catch (err) {
    console.error('Quiz list error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/quiz/submit - submit quiz answers
router.post('/quiz/submit', async (req, res) => {
  try {
    const { lesson_id, answers } = req.body;
    if (!lesson_id || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ code: 400, msg: 'Missing lesson_id or answers array' });
    }

    // Get correct answers
    const [quizzes] = await pool.query(
      'SELECT id, correct_answer, points FROM quizzes WHERE lesson_id = ?',
      [lesson_id]
    );

    if (quizzes.length === 0) {
      return res.status(400).json({ code: 400, msg: 'No quizzes found for this lesson' });
    }

    // Calculate score
    let correctCount = 0;
    const results = [];
    for (const quiz of quizzes) {
      const userAnswer = answers.find(a => a.quiz_id === quiz.id);
      const isCorrect = userAnswer && userAnswer.answer === quiz.correct_answer;
      if (isCorrect) correctCount++;
      results.push({
        quiz_id: quiz.id,
        correct_answer: quiz.correct_answer,
        is_correct: isCorrect
      });
    }

    const totalQuestions = quizzes.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const pointsEarned = correctCount * config.POINTS.QUIZ_CORRECT;
    const perfectBonus = score === 100 ? config.POINTS.QUIZ_PERFECT_BONUS : 0;
    const totalPoints = pointsEarned + perfectBonus;

    // Update user_lessons quiz score
    await pool.query(
      'UPDATE user_lessons SET score = ?, quiz_done = 1 WHERE user_id = ? AND lesson_id = ?',
      [score, req.userId, lesson_id]
    );

    // Award points
    if (totalPoints > 0) {
      await pool.query('UPDATE users SET points = points + ? WHERE id = ?', [totalPoints, req.userId]);
      await pool.query(
        'INSERT INTO points_log (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
        [req.userId, totalPoints, 'quiz', `答题获得 ${correctCount}/${totalQuestions} 正确 +${totalPoints}积分${perfectBonus > 0 ? ' (完美奖励)' : ''}`]
      );
    }

    res.json({
      code: 0,
      data: {
        score,
        correct_count: correctCount,
        total_questions: totalQuestions,
        points_earned: totalPoints,
        perfect_bonus: perfectBonus,
        results
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Quiz submit error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

module.exports = router;
