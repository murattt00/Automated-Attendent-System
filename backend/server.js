require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const { generateQRToken, cleanupSessionTokens } = require('./utils/token');
const logger = require('./config/logger');
const { generalLimiter } = require('./middleware/rateLimiter');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/,
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/
      ];
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') return origin === allowed;
        return allowed.test(origin);
      });
      
      callback(null, isAllowed);
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Socket.io compatibility
  crossOriginEmbedderPolicy: false
}));

// CORS Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Allow localhost and network IPs
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/,
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return origin === allowed;
      return allowed.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting Middleware (General)
app.use('/api/', generalLimiter);

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Make io accessible to routes
app.set('io', io);

// Health check endpoint (for Docker and monitoring)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: sequelize.authenticate() ? 'connected' : 'disconnected'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/class', require('./routes/class'));
app.use('/api/session', require('./routes/session'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/enrollment', require('./routes/enrollment'));
app.use('/api/password', require('./routes/password'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/export', require('./routes/export'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Store active QR token generators
const activeTokenGenerators = new Map();

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join session room
  socket.on('join_session', async (data) => {
    const { sessionId, role } = data;
    const roomName = `session_${sessionId}`;

    socket.join(roomName);
    console.log(`👤 ${role} joined session room: ${roomName}`);

    // If teacher, start QR token generation
    if (role === 'teacher') {
      // Clear any existing generator for this session
      if (activeTokenGenerators.has(sessionId)) {
        clearInterval(activeTokenGenerators.get(sessionId));
      }

      // Generate initial token (async)
      try {
        const initialToken = await generateQRToken(sessionId);
        socket.emit('qr_token', { token: initialToken, sessionId });
      } catch (error) {
        console.error('Error generating initial token:', error);
      }

      // Start rotating QR token
      const intervalId = setInterval(async () => {
        try {
          const token = await generateQRToken(sessionId);
          io.to(roomName).emit('qr_token', { token, sessionId });
          console.log(`🔄 New QR token generated for session ${sessionId}`);
        } catch (error) {
          console.error('Error generating QR token:', error);
        }
      }, parseInt(process.env.QR_ROTATION_INTERVAL) || 30000);

      // Store interval ID
      activeTokenGenerators.set(sessionId, intervalId);

      socket.on('disconnect', () => {
        console.log(`❌ Teacher disconnected from session ${sessionId}`);
        // Don't clear interval on disconnect, only on leave_session
      });
    }

    socket.emit('joined_session', {
      success: true,
      sessionId,
      roomName
    });
  });

  // Leave session room
  socket.on('leave_session', async (data) => {
    const { sessionId, role } = data;
    const roomName = `session_${sessionId}`;

    socket.leave(roomName);
    console.log(`👋 ${role} left session room: ${roomName}`);

    // If teacher leaves, stop QR token generation and cleanup Redis
    if (role === 'teacher' && activeTokenGenerators.has(sessionId)) {
      clearInterval(activeTokenGenerators.get(sessionId));
      activeTokenGenerators.delete(sessionId);

      // Cleanup all tokens for this session from Redis
      try {
        await cleanupSessionTokens(sessionId);
      } catch (error) {
        console.error('Error cleaning up session tokens:', error);
      }

      console.log(`🛑 Stopped QR token generation for session ${sessionId}`);
    }
  });

  // Manual attendance notification (handled by route, but can be triggered here)
  socket.on('manual_attendance_added', (data) => {
    const { sessionId, attendance } = data;
    io.to(`session_${sessionId}`).emit('new_attendance', { attendance });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`, { stack: err.stack });
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(500).json({ 
    success: false, 
    message 
  });
});

// Start server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models disabled - using manual SQL migrations
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('✅ Database models synchronized.');
    // }
    console.log('✅ Using existing database schema.');

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io enabled`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  
  // Clear all active token generators
  activeTokenGenerators.forEach((intervalId) => {
    clearInterval(intervalId);
  });
  activeTokenGenerators.clear();

  server.close(async () => {
    console.log('HTTP server closed');
    await sequelize.close();
    console.log('Database connection closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
