const express = require('express');
const { Class, User, sequelize } = require('../models');
const { authMiddleware, teacherOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createClassSchema } = require('../validators/class');
const router = express.Router();

// Create a new class
router.post('/', authMiddleware, teacherOnly, validate(createClassSchema), async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check if class code already exists
    const existingClass = await Class.findOne({ where: { code } });
    if (existingClass) {
      return res.status(400).json({ 
        success: false, 
        message: 'Class code already exists' 
      });
    }

    // Create class
    const classObj = await Class.create({
      name,
      code,
      teacher_id: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        class: classObj
      }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating class' 
    });
  }
});

// Get all classes for logged-in teacher
router.get('/my-classes', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { teacher_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { classes }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching classes' 
    });
  }
});

// Get analytics data for teacher
router.get('/analytics/dashboard', authMiddleware, teacherOnly, async (req, res) => {
  const { sequelize } = require('../models');
  
  try {
    const teacherId = req.user.id;

    // Get all classes for teacher
    const classes = await Class.findAll({
      where: { teacher_id: teacherId },
      attributes: ['id', 'name', 'code']
    });

    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalClasses: 0,
          totalSessions: 0,
          totalStudents: 0,
          overallAttendanceRate: 0,
          recentSessions: [],
          classStats: [],
          attendanceTrend: []
        }
      });
    }

    // Get total sessions
    const totalSessions = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM sessions
      WHERE class_id IN (:classIds)
    `, {
      replacements: { classIds },
      type: sequelize.QueryTypes.SELECT
    });

    // Get total enrolled students
    const totalStudents = await sequelize.query(`
      SELECT COUNT(DISTINCT student_id) as count
      FROM student_enrollments
      WHERE class_id IN (:classIds)
    `, {
      replacements: { classIds },
      type: sequelize.QueryTypes.SELECT
    });

    // Get overall attendance stats
    const attendanceStats = await sequelize.query(`
      SELECT 
        COUNT(*) as total_slots,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count
      FROM sessions s
      CROSS JOIN student_enrollments se
      LEFT JOIN attendances a ON s.id = a.session_id AND se.student_id = a.student_id
      WHERE s.class_id IN (:classIds)
        AND se.class_id = s.class_id
    `, {
      replacements: { classIds },
      type: sequelize.QueryTypes.SELECT
    });

    const attendanceRate = attendanceStats[0].total_slots > 0 
      ? (attendanceStats[0].present_count / attendanceStats[0].total_slots * 100).toFixed(1)
      : 0;

    // Get recent sessions (last 10)
    const recentSessions = await sequelize.query(`
      SELECT 
        s.id,
        s.start_time,
        s.end_time,
        c.name as class_name,
        c.code as class_code,
        COUNT(DISTINCT a.student_id) as attendance_count,
        COUNT(DISTINCT se.student_id) as total_students
      FROM sessions s
      JOIN classes c ON s.class_id = c.id
      LEFT JOIN attendances a ON s.id = a.session_id AND a.status = 'present'
      LEFT JOIN student_enrollments se ON c.id = se.class_id
      WHERE s.class_id IN (:classIds)
      GROUP BY s.id, s.start_time, s.end_time, c.name, c.code
      ORDER BY s.start_time DESC
      LIMIT 10
    `, {
      replacements: { classIds },
      type: sequelize.QueryTypes.SELECT
    });

    // Get per-class statistics
    const classStats = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        c.code,
        COUNT(DISTINCT s.id) as session_count,
        COUNT(DISTINCT se.student_id) as student_count,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
        (COUNT(DISTINCT s.id) * COUNT(DISTINCT se.student_id)) as total_slots
      FROM classes c
      LEFT JOIN sessions s ON c.id = s.class_id
      LEFT JOIN student_enrollments se ON c.id = se.class_id
      LEFT JOIN attendances a ON s.id = a.session_id AND a.student_id = se.student_id
      WHERE c.id IN (:classIds)
      GROUP BY c.id, c.name, c.code
      ORDER BY c.name
    `, {
      replacements: { classIds },
      type: sequelize.QueryTypes.SELECT
    });

    // Calculate attendance rate for each class
    const classStatsWithRate = classStats.map(stat => ({
      ...stat,
      attendance_rate: stat.total_slots > 0 
        ? ((stat.present_count / stat.total_slots) * 100).toFixed(1)
        : 0
    }));

    // Get attendance trend (last 14 days)
    const attendanceTrend = await sequelize.query(`
      SELECT 
        DATE(s.start_time) as date,
        COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present,
        COUNT(DISTINCT CASE WHEN a.status IS NULL THEN CONCAT(s.id, '-', se.student_id) END) as absent,
        COUNT(DISTINCT s.id) * COUNT(DISTINCT se.student_id) as total_slots
      FROM sessions s
      CROSS JOIN student_enrollments se
      LEFT JOIN attendances a ON s.id = a.session_id AND a.student_id = se.student_id
      WHERE s.class_id IN (:classIds)
        AND se.class_id = s.class_id
        AND s.start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(s.start_time)
      ORDER BY date DESC
      LIMIT 14
    `, {
      replacements: { classIds },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        totalClasses: classes.length,
        totalSessions: totalSessions[0].count,
        totalStudents: totalStudents[0].count,
        overallAttendanceRate: parseFloat(attendanceRate),
        presentCount: attendanceStats[0].present_count,
        absentCount: attendanceStats[0].total_slots - attendanceStats[0].present_count,
        recentSessions: recentSessions.map(s => ({
          ...s,
          attendance_rate: s.total_students > 0 
            ? ((s.attendance_count / s.total_students) * 100).toFixed(1)
            : 0
        })),
        classStats: classStatsWithRate,
        attendanceTrend: attendanceTrend.reverse()
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching analytics' 
    });
  }
});

// Get a specific class
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!classObj) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    res.json({
      success: true,
      data: { class: classObj }
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching class' 
    });
  }
});

// Get attendance history for a class
router.get('/:id/attendance-history', authMiddleware, async (req, res) => {
  try {
    const classObj = await Class.findByPk(req.params.id);

    if (!classObj) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Verify teacher ownership
    if (req.user.role === 'teacher' && classObj.teacher_id !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    // Get all sessions for this class
    const { Session, Attendance, User } = require('../models');
    const sessions = await Session.findAll({
      where: { class_id: req.params.id },
      order: [['start_time', 'DESC']],
      attributes: ['id', 'start_time', 'end_time', 'is_active']
    });

    // Get all attendances for these sessions
    const sessionIds = sessions.map(s => s.id);
    const attendances = await Attendance.findAll({
      where: { session_id: sessionIds },
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'student_no', 'email']
      }],
      attributes: ['id', 'session_id', 'student_id', 'type', 'createdAt']
    });

    // Get unique students who have attended at least once
    const studentMap = new Map();
    attendances.forEach(att => {
      if (att.student && !studentMap.has(att.student.id)) {
        studentMap.set(att.student.id, {
          id: att.student.id,
          name: att.student.name,
          student_no: att.student.student_no,
          email: att.student.email
        });
      }
    });
    const students = Array.from(studentMap.values());

    res.json({
      success: true,
      data: {
        sessions,
        students,
        attendances: attendances.map(att => ({
          id: att.id,
          session_id: att.session_id,
          student_id: att.student_id,
          type: att.type,
          createdAt: att.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching attendance history' 
    });
  }
});

// Get total unique students across teacher's classes
router.get('/stats/total-students', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { sequelize } = require('../models');
    
    const result = await sequelize.query(
      `SELECT COUNT(DISTINCT se.student_id) as total
       FROM student_enrollments se
       INNER JOIN classes c ON se.class_id = c.id
       WHERE c.teacher_id = ?`,
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: { total: result[0]?.total || 0 }
    });
  } catch (error) {
    console.error('Get total students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching total students' 
    });
  }
});

// Export attendance to Excel
router.get('/:id/export-excel', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const classId = req.params.id;
    const { generateAttendanceExcel } = require('../utils/excelExport');

    // Verify class ownership
    const classObj = await Class.findOne({
      where: { 
        id: classId, 
        teacher_id: req.user.id 
      },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }]
    });

    if (!classObj) {
      return res.status(403).json({ 
        success: false, 
        message: 'Class not found or unauthorized' 
      });
    }

    // Get attendance history (same query as attendance-history endpoint)
    const attendanceHistory = await sequelize.query(`
      SELECT 
        s.id as session_id,
        s.start_time as session_start,
        s.end_time as session_end,
        u.id as student_id,
        u.name as student_name,
        u.student_no,
        a.id as attendance_id,
        a.type as attendance_type,
        a.createdAt as attendance_time
      FROM sessions s
      CROSS JOIN users u
      LEFT JOIN attendances a ON a.session_id = s.id AND a.student_id = u.id
      WHERE s.class_id = ? 
        AND u.role = 'student'
        AND EXISTS (
          SELECT 1 FROM student_enrollments 
          WHERE student_id = u.id AND class_id = ?
        )
      ORDER BY s.start_time DESC, u.name ASC
    `, {
      replacements: [classId, classId],
      type: sequelize.QueryTypes.SELECT
    });

    // Generate Excel file
    const excelBuffer = generateAttendanceExcel(classObj.toJSON(), attendanceHistory);

    // Set headers for file download
    const filename = `Attendance_${classObj.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export Excel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while exporting to Excel' 
    });
  }
});

// Export class attendance as PDF
router.get('/:id/export-pdf', authMiddleware, teacherOnly, async (req, res) => {
  const { generateAttendancePDF } = require('../utils/pdfExport');
  
  try {
    const classId = req.params.id;
    const teacherId = req.user.id;

    // Verify teacher owns this class
    const classObj = await Class.findOne({
      where: { id: classId, teacher_id: teacherId },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found or unauthorized'
      });
    }

    // Get attendance history with sessions and students
    const attendanceHistory = await sequelize.query(`
      SELECT 
        s.id as session_id,
        s.start_time,
        s.end_time,
        u.id as student_id,
        u.student_no,
        u.name,
        CASE WHEN a.id IS NOT NULL THEN 'present' ELSE 'absent' END as status,
        a.type,
        a.createdAt as marked_at
      FROM sessions s
      CROSS JOIN users u
      LEFT JOIN attendances a ON s.id = a.session_id AND u.id = a.student_id
      WHERE s.class_id = :classId 
        AND u.role = 'student'
        AND EXISTS (
          SELECT 1 FROM student_enrollments 
          WHERE student_id = u.id AND class_id = :classId
        )
      ORDER BY s.start_time DESC, u.student_no ASC
    `, {
      replacements: { classId },
      type: sequelize.QueryTypes.SELECT
    });

    // Generate PDF file
    const pdfBuffer = await generateAttendancePDF(classObj.toJSON(), attendanceHistory);

    // Set headers for file download
    const filename = `Attendance_${classObj.code}_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate PDF file',
      error: error.message 
    });
  }
});

module.exports = router;
