const express = require('express');
const router = express.Router();
const pool = require('./db');
const config = require('./config');
const auth = require('./auth');

router.use(auth);

// POST /api/points/signin - daily sign-in with streak bonus
router.post('/points/signin', async (req, res) => {
  try {
    // Check if already signed in today
    const [todaySignin] = await pool.query(
      'SELECT id FROM points_log WHERE user_id = ? AND type = ? AND DATE(created_at) = CURDATE()',
      [req.userId, 'signin']
    );

    if (todaySignin.length > 0) {
      return res.json({ code: 0, data: { already_signed: true, points_awarded: 0 }, msg: 'Already signed in today' });
    }

    // Get user's streak info
    const [users] = await pool.query('SELECT streak_days, last_signin FROM users WHERE id = ?', [req.userId]);
    if (users.length === 0) {
      return res.status(400).json({ code: 400, msg: 'User not found' });
    }

    const user = users[0];
    let streakDays = user.streak_days || 0;
    const lastSignin = user.last_signin;

    // Check if last sign-in was yesterday to continue streak
    if (lastSignin) {
      const lastDate = new Date(lastSignin);
      const today = new Date();
      const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streakDays += 1;
      } else if (diffDays > 1) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    // Calculate points based on streak
    let pointsAwarded = config.POINTS.STREAK_BASE;
    if (streakDays >= 7) {
      pointsAwarded = config.POINTS.STREAK_MAX;
    } else if (streakDays >= 3) {
      pointsAwarded = Math.min(config.POINTS.STREAK_BASE + streakDays, config.POINTS.STREAK_MAX);
    }

    // Update user
    await pool.query(
      'UPDATE users SET points = points + ?, streak_days = ?, last_signin = NOW() WHERE id = ?',
      [pointsAwarded, streakDays, req.userId]
    );

    // Record transaction
    await pool.query(
      'INSERT INTO points_log (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [req.userId, pointsAwarded, 'signin', `连续签到 ${streakDays} 天，获得 +${pointsAwarded}积分`]
    );

    res.json({
      code: 0,
      data: {
        points_awarded: pointsAwarded,
        streak_days: streakDays,
        already_signed: false
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Signin error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/points/history - point transaction history
router.get('/points/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT id, amount, type, description, created_at FROM points_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.userId, limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM points_log WHERE user_id = ?',
      [req.userId]
    );

    res.json({
      code: 0,
      data: {
        list: rows,
        total: countResult[0].total,
        page,
        limit
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Points history error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/rewards/list - available rewards
router.get('/rewards/list', async (req, res) => {
  try {
    const [rewards] = await pool.query(
      'SELECT * FROM rewards WHERE status = 1 AND stock > 0 ORDER BY points_required ASC'
    );
    res.json({ code: 0, data: rewards, msg: 'success' });
  } catch (err) {
    console.error('Rewards list error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/rewards/claim - claim a reward
router.post('/rewards/claim', async (req, res) => {
  try {
    const { reward_id } = req.body;
    if (!reward_id) {
      return res.status(400).json({ code: 400, msg: 'Missing reward_id' });
    }

    // Get reward
    const [rewards] = await pool.query('SELECT * FROM rewards WHERE id = ? AND status = 1', [reward_id]);
    if (rewards.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Reward not found or unavailable' });
    }

    const reward = rewards[0];
    if (reward.stock <= 0) {
      return res.status(400).json({ code: 400, msg: 'Reward out of stock' });
    }

    // Check user points
    const [users] = await pool.query('SELECT points FROM users WHERE id = ?', [req.userId]);
    if (users[0].points < reward.points_required) {
      return res.status(400).json({ code: 400, msg: 'Insufficient points' });
    }

    // Deduct points and claim
    await pool.query('UPDATE users SET points = points - ? WHERE id = ?', [reward.points_required, req.userId]);
    await pool.query('UPDATE rewards SET stock = stock - 1 WHERE id = ?', [reward_id]);
    await pool.query(
      'INSERT INTO user_rewards (user_id, reward_id, points_spent) VALUES (?, ?, ?)',
      [req.userId, reward_id, reward.points_required]
    );
    await pool.query(
      'INSERT INTO points_log (user_id, amount, type, description) VALUES (?, ?, ?, ?)',
      [req.userId, -reward.points_required, 'redeem', `兑换 ${reward.name}，消耗 ${reward.points_required}积分`]
    );

    res.json({ code: 0, data: { reward_name: reward.name, points_spent: reward.points_required }, msg: 'success' });
  } catch (err) {
    console.error('Reward claim error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/user/rewards - user's claimed rewards
router.get('/user/rewards', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ur.id, ur.reward_id, ur.points_spent, ur.claimed_at, r.name, r.description, r.image
       FROM user_rewards ur
       JOIN rewards r ON ur.reward_id = r.id
       WHERE ur.user_id = ?
       ORDER BY ur.claimed_at DESC`,
      [req.userId]
    );
    res.json({ code: 0, data: rows, msg: 'success' });
  } catch (err) {
    console.error('User rewards error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/leaderboard - leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const range = req.query.range || req.query.period || 'all'; // weekly, monthly, all
    const limit = parseInt(req.query.limit) || 50;

    let dateFilter = '';
    if (range === 'weekly') {
      dateFilter = 'AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
    } else if (range === 'monthly') {
      dateFilter = 'AND pl.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    }

    const [rows] = await pool.query(
      `SELECT u.id, u.nickname, u.avatar, u.streak_days, SUM(pl.amount) as total_points
       FROM users u
       LEFT JOIN points_log pl ON u.id = pl.user_id AND pl.amount > 0 ${dateFilter}
       GROUP BY u.id
       ORDER BY total_points DESC
       LIMIT ?`,
      [limit]
    );

    // Get rank with current user
    let userRank = null;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].id === req.userId) {
        userRank = i + 1;
        break;
      }
    }

    res.json({
      code: 0,
      data: {
        list: rows,
        range,
        user_rank: userRank
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

module.exports = router;
