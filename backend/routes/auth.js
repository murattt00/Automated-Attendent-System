const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const logger = require('../config/logger');
const router = express.Router();

// Register
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, student_no, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      student_no: role === 'student' ? student_no : null,
      role: role || 'student'
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          student_no: user.student_no,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Login
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${user.email} (${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          student_no: user.student_no,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').authMiddleware, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = router;
