const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// Import routes
const routesAuth = require('./routes_auth');
const routesCourse = require('./routes_course');
const routesPoints = require('./routes_points');
const routesInvitation = require('./routes_invitation');
const routesMessage = require('./routes_message');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Static files for uploads
const uploadDir = config.UPLOAD_DIR;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ code: 0, data: { status: 'ok', time: new Date().toISOString() }, msg: 'success' });
});

// Upload endpoint
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ code: 400, msg: 'File too large, max 5MB' });
        }
        return res.status(400).json({ code: 400, msg: err.message });
      }
      return res.status(400).json({ code: 400, msg: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ code: 400, msg: 'No file uploaded' });
    }

    res.json({
      code: 0,
      data: {
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      msg: 'success'
    });
  });
});

// Mount routes
app.use('/api/auth', routesAuth);      // /api/auth/login, /api/auth/profile, /api/auth/user/:id
app.use('/api', routesCourse);         // /api/course/*, /api/lesson/*, /api/quiz/*
app.use('/api', routesPoints);         // /api/points/*, /api/rewards/*, /api/user/rewards, /api/leaderboard
app.use('/api', routesInvitation);     // /api/invitation/*
app.use('/api/message', routesMessage); // /api/message/*

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 404, msg: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ code: 500, msg: 'Internal server error' });
});

// Start server
app.listen(config.PORT, () => {
  console.log(`AI Learn Server running on port ${config.PORT}`);
  console.log(`Health check: http://localhost:${config.PORT}/api/health`);
});

module.exports = app;
