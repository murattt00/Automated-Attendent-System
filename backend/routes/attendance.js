const express = require('express');
const { getDistance } = require('geolib');
const { Attendance, Session, Class, User, sequelize } = require('../models');
const { authMiddleware, studentOnly, teacherOnly } = require('../middleware/auth');
const { verifyQRToken, generateDeviceFingerprint } = require('../utils/token');
const validate = require('../middleware/validate');
const { submitAttendanceSchema, manualAttendanceSchema } = require('../validators/attendance');
const { attendanceLimiter } = require('../middleware/rateLimiter');
const logger = require('../config/logger');
const router = express.Router();

// Submit attendance via QR scan
router.post('/submit', attendanceLimiter, authMiddleware, studentOnly, validate(submitAttendanceSchema), async (req, res) => {
  try {
    const { token, lat, long } = req.body;
    const studentId = req.user.id;

    // Verify QR token
    const tokenVerification = verifyQRToken(token);
    if (!tokenVerification.valid) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid QR code: ${tokenVerification.reason}` 
      });
    }

    const { sessionId } = tokenVerification.data;

    // Get session with class info
    const session = await Session.findByPk(sessionId, {
      include: [{ model: Class, as: 'class' }]
    });
    
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        message: 'Session not found' 
      });
    }

    if (!session.is_active) {
      return res.status(400).json({ 
        success: false, 
        message: 'Session has ended' 
      });
    }

    // Check if student is enrolled in this class
    const [enrollment] = await sequelize.query(
      'SELECT * FROM student_enrollments WHERE student_id = ? AND class_id = ?',
      {
        replacements: [studentId, session.class_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!enrollment) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not enrolled in this class. Please enroll first.' 
      });
    }

    // Calculate distance
    const distance = getDistance(
      { latitude: session.lat, longitude: session.long },
      { latitude: lat, longitude: long }
    );

    const maxDistance = parseInt(process.env.MAX_DISTANCE_METERS) || 100;
    if (distance > maxDistance) {
      return res.status(403).json({ 
        success: false, 
        message: `You are too far from the classroom (${distance}m away, max ${maxDistance}m allowed)` 
      });
    }

    // Generate device fingerprint
    const deviceFingerprint = generateDeviceFingerprint(
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent'] || ''
    );

    // Check if already attended
    const existingAttendance = await Attendance.findOne({
      where: { 
        session_id: sessionId, 
        student_id: studentId 
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already marked attendance for this session' 
      });
    }

    // Check device fingerprint (prevent multiple students from same device)
    const duplicateDevice = await Attendance.findOne({
      where: { 
        session_id: sessionId, 
        device_fingerprint: deviceFingerprint 
      }
    });

    if (duplicateDevice && duplicateDevice.student_id !== studentId) {
      return res.status(403).json({ 
        success: false, 
        message: 'This device has already been used for attendance in this session' 
      });
    }

    // Create attendance record
    const attendance = await Attendance.create({
      session_id: sessionId,
      student_id: studentId,
      type: 'QR',
      device_fingerprint: deviceFingerprint
    });

    // Fetch complete attendance data for socket emission
    const attendanceData = await Attendance.findByPk(attendance.id, {
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'student_no', 'email']
      }]
    });

    // Emit to socket room (handled in server.js)
    req.app.get('io').to(`session_${sessionId}`).emit('new_attendance', {
      attendance: attendanceData
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        attendance: attendanceData,
        distance: distance
      }
    });
  } catch (error) {
    console.error('Submit attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while submitting attendance' 
    });
  }
});

// Manual attendance entry by teacher
router.post('/manual', authMiddleware, teacherOnly, validate(manualAttendanceSchema), async (req, res) => {
  try {
    const { session_id, student_id, student_no } = req.body;

    // Verify session ownership
    const session = await Session.findByPk(session_id, {
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
        message: 'Session has ended' 
      });
    }

    // Find student by ID or student_no
    let student;
    if (student_id) {
      student = await User.findOne({
        where: { id: student_id, role: 'student' }
      });
    } else if (student_no) {
      student = await User.findOne({
        where: { student_no: student_no, role: 'student' }
      });
    }

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Check if already attended
    const existingAttendance = await Attendance.findOne({
      where: { 
        session_id: session_id, 
        student_id: student.id 
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student has already marked attendance' 
      });
    }

    // Create manual attendance
    const attendance = await Attendance.create({
      session_id: session_id,
      student_id: student.id,
      type: 'MANUEL',
      device_fingerprint: null // No fingerprint for manual entry
    });

    // Fetch complete attendance data
    const attendanceData = await Attendance.findByPk(attendance.id, {
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'student_no', 'email']
      }]
    });

    // Emit to socket room
    req.app.get('io').to(`session_${session_id}`).emit('new_attendance', {
      attendance: attendanceData
    });

    res.status(201).json({
      success: true,
      message: 'Manual attendance recorded successfully',
      data: {
        attendance: attendanceData
      }
    });
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while recording manual attendance' 
    });
  }
});

// Get student's attendance history (simple list)
router.get('/my-attendance', authMiddleware, studentOnly, async (req, res) => {
  try {
    const attendances = await Attendance.findAll({
      where: { student_id: req.user.id },
      include: [{
        model: Session,
        as: 'session',
        include: [{
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'code']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { attendances }
    });
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching attendance history' 
    });
  }
});

// Get student's attendance history by class (like teacher's view but for enrolled classes)
router.get('/my-class-history', authMiddleware, studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all enrolled classes
    const enrolledClasses = await sequelize.query(
      `SELECT c.id, c.name, c.code, u.name as teacher_name
       FROM classes c
       INNER JOIN student_enrollments se ON c.id = se.class_id
       LEFT JOIN users u ON c.teacher_id = u.id
       WHERE se.student_id = ?
       ORDER BY c.name ASC`,
      {
        replacements: [studentId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // For each class, get all sessions and student's attendance
    const classHistories = await Promise.all(enrolledClasses.map(async (classItem) => {
      // Get all sessions for this class
      const sessions = await Session.findAll({
        where: { class_id: classItem.id },
        attributes: ['id', 'start_time', 'end_time', 'is_active'],
        order: [['start_time', 'DESC']]
      });

      // Get student's attendances for these sessions
      const sessionIds = sessions.map(s => s.id);
      const attendances = await Attendance.findAll({
        where: {
          session_id: sessionIds,
          student_id: studentId
        },
        attributes: ['id', 'session_id', 'type', 'createdAt']
      });

      // Create attendance map
      const attendanceMap = {};
      attendances.forEach(att => {
        attendanceMap[att.session_id] = {
          type: att.type,
          createdAt: att.createdAt
        };
      });

      return {
        class_id: classItem.id,
        class_name: classItem.name,
        class_code: classItem.code,
        teacher_name: classItem.teacher_name,
        sessions: sessions.map(session => ({
          id: session.id,
          start_time: session.start_time,
          end_time: session.end_time,
          is_active: session.is_active,
          attendance: attendanceMap[session.id] || null
        }))
      };
    }));

    res.json({
      success: true,
      data: { classes: classHistories }
    });
  } catch (error) {
    console.error('Get my class history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching class history' 
    });
  }
});

module.exports = router;
