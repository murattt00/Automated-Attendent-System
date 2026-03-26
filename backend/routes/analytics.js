const express = require('express');
const { Session, Class, Attendance, User, sequelize } = require('../models');
const { authMiddleware, teacherOnly, studentOnly } = require('../middleware/auth');
const logger = require('../config/logger');
const router = express.Router();

// ========================================
// TEACHER ANALYTICS
// ========================================

// Get dashboard summary for teacher
router.get('/teacher/summary', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Total classes
    const totalClasses = await Class.count({
      where: { teacher_id: teacherId }
    });

    // Total sessions
    const [{ total_sessions }] = await sequelize.query(
      `SELECT COUNT(*) as total_sessions
       FROM sessions s
       INNER JOIN classes c ON s.class_id = c.id
       WHERE c.teacher_id = ?`,
      {
        replacements: [teacherId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Active sessions
    const activeSessions = await Session.count({
      include: [{
        model: Class,
        as: 'class',
        where: { teacher_id: teacherId },
        attributes: []
      }],
      where: { is_active: true }
    });

    // Total students (enrolled across all classes)
    const [{ total_students }] = await sequelize.query(
      `SELECT COUNT(DISTINCT se.student_id) as total_students
       FROM student_enrollments se
       INNER JOIN classes c ON se.class_id = c.id
       WHERE c.teacher_id = ? AND se.status = 'approved'`,
      {
        replacements: [teacherId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Total attendances
    const [{ total_attendances }] = await sequelize.query(
      `SELECT COUNT(*) as total_attendances
       FROM attendances a
       INNER JOIN sessions s ON a.session_id = s.id
       INNER JOIN classes c ON s.class_id = c.id
       WHERE c.teacher_id = ?`,
      {
        replacements: [teacherId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Pending enrollment requests
    const [{ pending_enrollments }] = await sequelize.query(
      `SELECT COUNT(*) as pending_enrollments
       FROM student_enrollments se
       INNER JOIN classes c ON se.class_id = c.id
       WHERE c.teacher_id = ? AND se.status = 'pending'`,
      {
        replacements: [teacherId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        total_classes: parseInt(totalClasses),
        total_sessions: parseInt(total_sessions) || 0,
        active_sessions: parseInt(activeSessions),
        total_students: parseInt(total_students) || 0,
        total_attendances: parseInt(total_attendances) || 0,
        pending_enrollments: parseInt(pending_enrollments) || 0
      }
    });
  } catch (error) {
    logger.error('Teacher summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get attendance statistics for a specific class
router.get('/teacher/class/:classId/stats', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    // Verify ownership
    const classObj = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or unauthorized'
      });
    }

    // Total enrolled students
    const [{ total_students }] = await sequelize.query(
      `SELECT COUNT(*) as total_students
       FROM student_enrollments
       WHERE class_id = ? AND status = 'approved'`,
      {
        replacements: [classId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Total sessions
    const total_sessions = await Session.count({
      where: { class_id: classId }
    });

    // Attendance rate per session
    const sessionAttendance = await sequelize.query(
      `SELECT s.id, s.start_time, s.end_time, s.is_active,
              COUNT(a.id) as attendance_count
       FROM sessions s
       LEFT JOIN attendances a ON s.id = a.session_id
       WHERE s.class_id = ?
       GROUP BY s.id
       ORDER BY s.start_time DESC
       LIMIT 10`,
      {
        replacements: [classId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Calculate average attendance rate
    const avgAttendanceRate = sessionAttendance.length > 0 && total_students > 0
      ? (sessionAttendance.reduce((sum, s) => sum + parseInt(s.attendance_count), 0) / (sessionAttendance.length * parseInt(total_students))) * 100
      : 0;

    // Student attendance leaderboard
    const studentStats = await sequelize.query(
      `SELECT u.id, u.name, u.student_no,
              COUNT(a.id) as attended_sessions,
              ? as total_sessions,
              ROUND((COUNT(a.id) / ?) * 100, 2) as attendance_rate
       FROM users u
       INNER JOIN student_enrollments se ON u.id = se.student_id
       LEFT JOIN attendances a ON u.id = a.student_id AND EXISTS (
         SELECT 1 FROM sessions s WHERE s.id = a.session_id AND s.class_id = ?
       )
       WHERE se.class_id = ? AND se.status = 'approved'
       GROUP BY u.id
       ORDER BY attendance_rate DESC, u.name ASC`,
      {
        replacements: [total_sessions, total_sessions || 1, classId, classId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        class_info: {
          id: classObj.id,
          name: classObj.name,
          code: classObj.code
        },
        total_students: parseInt(total_students) || 0,
        total_sessions,
        avg_attendance_rate: avgAttendanceRate.toFixed(2),
        recent_sessions: sessionAttendance,
        student_stats: studentStats
      }
    });
  } catch (error) {
    logger.error('Class stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get monthly attendance trend
router.get('/teacher/trend', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { months = 6 } = req.query; // Default 6 months

    const trend = await sequelize.query(
      `SELECT DATE_FORMAT(s.start_time, '%Y-%m') as month,
              COUNT(DISTINCT s.id) as sessions_count,
              COUNT(a.id) as total_attendances
       FROM sessions s
       INNER JOIN classes c ON s.class_id = c.id
       LEFT JOIN attendances a ON s.id = a.session_id
       WHERE c.teacher_id = ? AND s.start_time >= DATE_SUB(NOW(), INTERVAL ? MONTH)
       GROUP BY DATE_FORMAT(s.start_time, '%Y-%m')
       ORDER BY month ASC`,
      {
        replacements: [teacherId, parseInt(months)],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: { trend }
    });
  } catch (error) {
    logger.error('Teacher trend error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ========================================
// STUDENT ANALYTICS
// ========================================

// Get dashboard summary for student
router.get('/student/summary', authMiddleware, studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Total enrolled classes
    const [{ total_classes }] = await sequelize.query(
      `SELECT COUNT(*) as total_classes
       FROM student_enrollments
       WHERE student_id = ? AND status = 'approved'`,
      {
        replacements: [studentId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Total sessions available
    const [{ total_sessions }] = await sequelize.query(
      `SELECT COUNT(DISTINCT s.id) as total_sessions
       FROM sessions s
       INNER JOIN student_enrollments se ON s.class_id = se.class_id
       WHERE se.student_id = ? AND se.status = 'approved'`,
      {
        replacements: [studentId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Total attendances marked
    const total_attendances = await Attendance.count({
      where: { student_id: studentId }
    });

    // Attendance rate
    const attendance_rate = total_sessions > 0
      ? ((total_attendances / parseInt(total_sessions)) * 100).toFixed(2)
      : 0;

    // Pending enrollment requests
    const [{ pending_enrollments }] = await sequelize.query(
      `SELECT COUNT(*) as pending_enrollments
       FROM student_enrollments
       WHERE student_id = ? AND status = 'pending'`,
      {
        replacements: [studentId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: {
        total_classes: parseInt(total_classes) || 0,
        total_sessions: parseInt(total_sessions) || 0,
        total_attendances,
        attendance_rate: parseFloat(attendance_rate),
        pending_enrollments: parseInt(pending_enrollments) || 0
      }
    });
  } catch (error) {
    logger.error('Student summary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student's attendance per class
router.get('/student/by-class', authMiddleware, studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;

    const classAttendance = await sequelize.query(
      `SELECT c.id, c.name as class_name, c.code,
              COUNT(DISTINCT s.id) as total_sessions,
              COUNT(a.id) as attended_sessions,
              ROUND((COUNT(a.id) / COUNT(DISTINCT s.id)) * 100, 2) as attendance_rate
       FROM classes c
       INNER JOIN student_enrollments se ON c.id = se.class_id
       LEFT JOIN sessions s ON c.id = s.class_id
       LEFT JOIN attendances a ON s.id = a.session_id AND a.student_id = ?
       WHERE se.student_id = ? AND se.status = 'approved'
       GROUP BY c.id
       ORDER BY c.name ASC`,
      {
        replacements: [studentId, studentId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: { classes: classAttendance }
    });
  } catch (error) {
    logger.error('Student by class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get student's attendance history (timeline)
router.get('/student/history', authMiddleware, studentOnly, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { limit = 20 } = req.query;

    const history = await sequelize.query(
      `SELECT a.id, a.type, a.createdAt as marked_at,
              s.start_time, s.end_time,
              c.id as class_id, c.name as class_name, c.code as class_code
       FROM attendances a
       INNER JOIN sessions s ON a.session_id = s.id
       INNER JOIN classes c ON s.class_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.createdAt DESC
       LIMIT ?`,
      {
        replacements: [studentId, parseInt(limit)],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: { history }
    });
  } catch (error) {
    logger.error('Student history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
