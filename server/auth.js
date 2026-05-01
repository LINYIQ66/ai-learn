const jwt = require('jsonwebtoken');
const config = require('./config');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ code: 401, msg: 'No authorization token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ code: 401, msg: 'Token format invalid, use: Bearer <token>' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.userId;
    req.userInfo = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 401, msg: 'Token expired' });
    }
    return res.status(401).json({ code: 401, msg: 'Invalid token' });
  }
}

module.exports = authMiddleware;
