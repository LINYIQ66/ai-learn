const express = require('express');
const router = express.Router();
const pool = require('./db');
const auth = require('./auth');

router.use(auth);

// POST /api/message/send - send a message to another user
router.post('/send', async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    if (!receiver_id || !content) {
      return res.status(400).json({ code: 400, msg: 'Missing receiver_id or content' });
    }

    if (parseInt(receiver_id) === req.userId) {
      return res.status(400).json({ code: 400, msg: 'Cannot send message to yourself' });
    }

    // Check receiver exists
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [receiver_id]);
    if (users.length === 0) {
      return res.status(400).json({ code: 400, msg: 'Receiver not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [req.userId, receiver_id, content]
    );

    // Get conversation id (the smaller id first for consistency)
    const convId = Math.min(req.userId, receiver_id) + '_' + Math.max(req.userId, receiver_id);

    res.json({
      code: 0,
      data: {
        id: result.insertId,
        sender_id: req.userId,
        receiver_id,
        content,
        created_at: new Date().toISOString()
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Send message error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/message/chat - get chat messages between current user and another user
router.get('/chat', async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ code: 400, msg: 'Missing user_id query param' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at, m.is_read
       FROM messages m
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.userId, user_id, user_id, req.userId, limit, offset]
    );

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
      [user_id, req.userId]
    );

    res.json({
      code: 0,
      data: {
        list: rows.reverse(),
        page,
        limit
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Chat messages error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/message/conversations - list conversations
router.get('/conversations', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         m.sender_id, m.receiver_id, m.content as last_message, m.created_at as last_time,
         u.id as other_user_id, u.nickname as other_nickname, u.avatar as other_avatar,
         (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = m.receiver_id AND m2.receiver_id = m.sender_id AND m2.is_read = 0) as unread_count
       FROM messages m
       JOIN users u ON (u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
       WHERE m.id IN (
         SELECT MAX(m3.id) FROM messages m3
         WHERE m3.sender_id = ? OR m3.receiver_id = ?
         GROUP BY
           CASE WHEN m3.sender_id < m3.receiver_id THEN CONCAT(m3.sender_id, '_', m3.receiver_id)
           ELSE CONCAT(m3.receiver_id, '_', m3.sender_id) END
       )
       ORDER BY m.created_at DESC`,
      [req.userId, req.userId, req.userId]
    );

    res.json({ code: 0, data: rows, msg: 'success' });
  } catch (err) {
    console.error('Conversations error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/message/list - notification messages
router.get('/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.userId, limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
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
    console.error('Notifications list error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// GET /api/message/unread-count - unread messages count
router.get('/unread-count', async (req, res) => {
  try {
    const [msgUnread] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [req.userId]
    );

    const [notifUnread] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.userId]
    );

    res.json({
      code: 0,
      data: {
        messages: msgUnread[0].count,
        notifications: notifUnread[0].count,
        total: msgUnread[0].count + notifUnread[0].count
      },
      msg: 'success'
    });
  } catch (err) {
    console.error('Unread count error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

// POST /api/message/read - mark notifications as read
router.post('/read', async (req, res) => {
  try {
    const { notification_id } = req.body;
    if (notification_id) {
      await pool.query(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [notification_id, req.userId]
      );
    } else {
      // Mark all as read
      await pool.query(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
        [req.userId]
      );
    }

    res.json({ code: 0, data: { marked_read: true }, msg: 'success' });
  } catch (err) {
    console.error('Read notification error:', err.message);
    res.status(500).json({ code: 500, msg: 'Internal server error' });
  }
});

module.exports = router;
