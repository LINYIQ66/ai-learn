const express = require('express');
const router = express.Router();
const pool = require('./db');
const auth = require('./auth');

router.use(auth);

// POST /api/invitation/create - create a study invitation
router.post('/invitation/create', async (req, res) => {
  try {
    const { title, description, max_members, course_id, start_time, end_time } = req.body;
    if (!title) {
      return res.status(400).json({ code: 400, msg: 'Missing title' });
    }

    const [result] = await pool.query(
      'INSERT INTO invitations (creator_id, title, description, max_members, course_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, title, description || '', max_members || 10, course_id || null, start_time || null, end_time || null]
    );

    const [invitation] = await pool.query('SELECT * FROM invitations WHERE id = ?', [result.insertId]);

    res.json({ code: 0, data: invitation[0], msg: 'success' });
  } catch (err) {
    console.error('Create invitation error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/invitation/list - list invitations (open/public)
router.get('/invitation/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT i.*, u.nickname as creator_name, u.avatar as creator_avatar,
       (SELECT COUNT(*) FROM invitation_members im WHERE im.invitation_id = i.id) as member_count
       FROM invitations i
       JOIN users u ON i.creator_id = u.id
       WHERE i.status = 'open'
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query(
      "SELECT COUNT(*) as total FROM invitations WHERE status = 'open'"
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
    console.error('Invitation list error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/invitation/detail/:id
router.get('/invitation/detail/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, u.nickname as creator_name, u.avatar as creator_avatar,
       (SELECT COUNT(*) FROM invitation_members im WHERE im.invitation_id = i.id) as member_count
       FROM invitations i
       JOIN users u ON i.creator_id = u.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Invitation not found' });
    }

    // Get members
    const [members] = await pool.query(
      `SELECT u.id, u.nickname, u.avatar, im.joined_at
       FROM invitation_members im
       JOIN users u ON im.user_id = u.id
       WHERE im.invitation_id = ?
       ORDER BY im.joined_at ASC`,
      [req.params.id]
    );

    // Check if current user has joined
    const [myJoin] = await pool.query(
      'SELECT id FROM invitation_members WHERE invitation_id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );

    rows[0].members = members;
    rows[0].has_joined = myJoin.length > 0;
    rows[0].is_creator = rows[0].creator_id === req.userId;

    res.json({ code: 0, data: rows[0], msg: 'success' });
  } catch (err) {
    console.error('Invitation detail error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/invitation/join - join an invitation
router.post('/invitation/join', async (req, res) => {
  try {
    const { invitation_id } = req.body;
    if (!invitation_id) {
      return res.status(400).json({ code: 400, msg: 'Missing invitation_id' });
    }

    const [invitations] = await pool.query('SELECT * FROM invitations WHERE id = ?', [invitation_id]);
    if (invitations.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Invitation not found' });
    }

    const invitation = invitations[0];
    if (invitation.status !== 'open') {
      return res.status(400).json({ code: 400, msg: 'Invitation is not open' });
    }

    // Check member limit
    const [memberCount] = await pool.query(
      'SELECT COUNT(*) as count FROM invitation_members WHERE invitation_id = ?',
      [invitation_id]
    );

    if (memberCount[0].count >= invitation.max_members) {
      return res.status(400).json({ code: 400, msg: 'Invitation is full' });
    }

    // Check if already joined
    const [existing] = await pool.query(
      'SELECT id FROM invitation_members WHERE invitation_id = ? AND user_id = ?',
      [invitation_id, req.userId]
    );

    if (existing.length > 0) {
      return res.json({ code: 0, data: { already_joined: true }, msg: 'Already joined' });
    }

    await pool.query(
      'INSERT INTO invitation_members (invitation_id, user_id) VALUES (?, ?)',
      [invitation_id, req.userId]
    );

    res.json({ code: 0, data: { already_joined: false }, msg: 'success' });
  } catch (err) {
    console.error('Join invitation error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/invitation/cancel-join - cancel joining an invitation
router.post('/invitation/cancel-join', async (req, res) => {
  try {
    const { invitation_id } = req.body;
    if (!invitation_id) {
      return res.status(400).json({ code: 400, msg: 'Missing invitation_id' });
    }

    const [result] = await pool.query(
      'DELETE FROM invitation_members WHERE invitation_id = ? AND user_id = ?',
      [invitation_id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ code: 400, msg: 'You have not joined this invitation' });
    }

    res.json({ code: 0, data: { cancelled: true }, msg: 'success' });
  } catch (err) {
    console.error('Cancel join error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/invitation/close - close an invitation (creator only)
router.post('/invitation/close', async (req, res) => {
  try {
    const { invitation_id } = req.body;
    if (!invitation_id) {
      return res.status(400).json({ code: 400, msg: 'Missing invitation_id' });
    }

    const [invitations] = await pool.query(
      'SELECT * FROM invitations WHERE id = ? AND creator_id = ?',
      [invitation_id, req.userId]
    );

    if (invitations.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Invitation not found or not authorized' });
    }

    await pool.query('UPDATE invitations SET status = ? WHERE id = ?', ['closed', invitation_id]);

    res.json({ code: 0, data: { closed: true }, msg: 'success' });
  } catch (err) {
    console.error('Close invitation error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/invitation/mine - invitations created by current user
router.get('/invitation/mine', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT i.*,
       (SELECT COUNT(*) FROM invitation_members im WHERE im.invitation_id = i.id) as member_count
       FROM invitations i
       WHERE i.creator_id = ?
       ORDER BY i.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.userId, limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM invitations WHERE creator_id = ?',
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
    console.error('My invitations error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/invitation/joined - invitations the current user has joined
router.get('/invitation/joined', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT i.*, u.nickname as creator_name, u.avatar as creator_avatar,
       (SELECT COUNT(*) FROM invitation_members im WHERE im.invitation_id = i.id) as member_count
       FROM invitations i
       JOIN invitation_members im ON i.id = im.invitation_id
       JOIN users u ON i.creator_id = u.id
       WHERE im.user_id = ?
       ORDER BY im.joined_at DESC
       LIMIT ? OFFSET ?`,
      [req.userId, limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM invitation_members WHERE user_id = ?',
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
    console.error('Joined invitations error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

module.exports = router;
