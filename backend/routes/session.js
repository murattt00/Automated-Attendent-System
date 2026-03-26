const express = require('express');
const { Session, Class, Attendance, User } = require('../models');
const { authMiddleware, teacherOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { startSessionSchema } = require('../validators/session');
const { cleanupSessionTokens } = require('../utils/token');
const router = express.Router();

// Start a new session
router.post('/start', authMiddleware, teacherOnly, validate(startSessionSchema), async (req, res) => {
  try {
    const { class_id, lat, long } = req.body;

    // Validate class ownership
    const classObj = await Class.findOne({
      where: { 
        id: class_id, 
        teacher_id: req.user.id 
      }
    });

    if (!classObj) {
      return res.status(403).json({ 
        success: false, 
        message: 'Class not found or unauthorized' 
      });
    }

    // Check if there's already an active session for this class
    const activeSession = await Session.findOne({
      where: { 
        class_id, 
        is_active: true 
      }
    });

    if (activeSession) {
      return res.status(400).json({ 
        success: false, 
        message: 'An active session already exists for this class' 
      });
    }

    // Create new session
    const session = await Session.create({
      class_id,
      lat: lat || null,
      long: long || null,
      start_time: new Date(),
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Session started successfully',
      data: {
        session: {
          id: session.id,
          class_id: session.class_id,
          start_time: session.start_time,
          lat: session.lat,
          long: session.long,
          is_active: session.is_active
        }
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while starting session',
      error: error.message 
    });
  }
});

// End a session
router.post('/end/:sessionId', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findByPk(sessionId, {
      include: [{
        model: Class,
        as: 'class',
        where: { teacher_id: req.user.id }
      }]
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found or unauthorized' 
      });
    }

    if (!session.is_active) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session is already ended' 
      });
    }

    session.is_active = false;
    session.end_time = new Date();
    await session.save();

    // Cleanup all QR tokens for this session from Redis
    try {
      await cleanupSessionTokens(sessionId);
    } catch (error) {
      console.error('Error cleaning up session tokens:', error);
      // Don't fail the request if cleanup fails
    }

    res.json({
      success: true,
      message: 'Session ended successfully',
      data: { session }
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while ending session' 
    });
  }
});

// Get active sessions for the logged-in teacher
router.get('/active', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: { is_active: true },
      include: [{
        model: Class,
        as: 'class',
        where: { teacher_id: req.user.id },
        attributes: ['id', 'name', 'code']
      }],
      order: [['start_time', 'DESC']]
    });

    // Format response with class name
    const formattedSessions = sessions.map(session => ({
      id: session.id,
      class_id: session.class_id,
      class_name: session.class.name,
      start_time: session.start_time,
      is_active: session.is_active
    }));

    res.json({
      success: true,
      data: { sessions: formattedSessions }
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching active sessions' 
    });
  }
});

// Get session details with attendances
router.get('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findByPk(sessionId, {
      include: [
        {
          model: Class,
          as: 'class',
          include: [{
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email']
          }]
        },
        {
          model: Attendance,
          as: 'attendances',
          include: [{
            model: User,
            as: 'student',
            attributes: ['id', 'name', 'student_no', 'email']
          }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    // Check authorization
    if (req.user.role === 'teacher' && session.class.teacher_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching session' 
    });
  }
});

module.exports = router;
