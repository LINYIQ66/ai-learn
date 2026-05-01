const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('./db');
const config = require('./config');
const auth = require('./auth');

// POST /api/auth/login - WeChat login using wx.login code
router.post('/login', async (req, res) => {
  try {
    const { code, nickname, avatar, gender } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, msg: 'Missing wx.login code' });
    }

    // Exchange code for openid & session_key from WeChat API
    const wxResp = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.WX.appid,
        secret: config.WX.secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, unionid, errcode, errmsg } = wxResp.data;
    if (errcode) {
      return res.status(400).json({ code: 400, msg: `WeChat login failed: ${errmsg || errcode}` });
    }

    if (!openid) {
      return res.status(400).json({ code: 400, msg: 'Failed to get openid from WeChat' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT * FROM users WHERE openid = ?', [openid]);

    let userId;
    if (existing.length > 0) {
      userId = existing[0].id;
      // Update login time
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
      // Update profile info if provided
      if (nickname) {
        const updates = [];
        const params = [];
        if (nickname) { updates.push('nickname = ?'); params.push(nickname); }
        if (avatar) { updates.push('avatar = ?'); params.push(avatar); }
        if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }
        if (updates.length > 0) {
          params.push(userId);
          await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
        }
      }
    } else {
      // Create new user
      const [result] = await pool.query(
        'INSERT INTO users (openid, nickname, avatar, gender) VALUES (?, ?, ?, ?)',
        [openid, nickname || '微信用户', avatar || '', gender || 0]
      );
      userId = result.insertId;
    }

    // Fetch full user data
    const [users] = await pool.query(
      'SELECT id, openid, nickname, avatar, gender, points, level, streak_days, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );
    const user = users[0];

    // Generate JWT token (7 days expiry)
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      code: 0,
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          points: user.points,
          level: user.level,
          streak_days: user.streak_days,
          created_at: user.created_at
        }
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/auth/profile - get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, openid, nickname, avatar, gender, points, level, streak_days, created_at, last_login FROM users WHERE id = ?',
      [req.userId]
    );
    if (users.length === 0) {
      return res.status(400).json({ code: 400, msg: 'User not found' });
    }
    res.json({ code: 0, data: users[0], msg: 'success' });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/auth/profile/update - update user profile
router.post('/profile/update', auth, async (req, res) => {
  try {
    const { nickname, avatar, gender } = req.body;
    const updates = [];
    const params = [];

    if (nickname !== undefined) { updates.push('nickname = ?'); params.push(nickname); }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
    if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }

    if (updates.length === 0) {
      return res.status(400).json({ code: 400, msg: 'No fields to update' });
    }

    params.push(req.userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    // Return updated profile
    const [users] = await pool.query(
      'SELECT id, openid, nickname, avatar, gender, points, level, streak_days, created_at, last_login FROM users WHERE id = ?',
      [req.userId]
    );

    res.json({ code: 0, data: users[0], msg: 'success' });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/auth/user/:id - get other user's public info
router.get('/user/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nickname, avatar, gender, points, level, streak_days, created_at FROM users WHERE id = ?',
      [req.params.id]
    );
    if (users.length === 0) {
      return res.status(400).json({ code: 400, msg: 'User not found' });
    }
    res.json({ code: 0, data: users[0], msg: 'success' });
  } catch (err) {
    console.error('User info error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

module.exports = router;
