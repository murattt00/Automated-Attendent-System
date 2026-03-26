const express = require('express');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const { Session, Class, Attendance, User, sequelize } = require('../models');
const { authMiddleware, teacherOnly } = require('../middleware/auth');
const logger = require('../config/logger');
const router = express.Router();

// Export attendance as Excel için specific session
router.get('/session/:sessionId/excel', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user.id;

    // Get session with attendances
    const session = await Session.findByPk(sessionId, {
      include: [
        {
          model: Class,
          as: 'class',
          where: { teacher_id: teacherId },
          include: [{
            model: User,
            as: 'teacher',
            attributes: ['name', 'email']
          }]
        },
        {
          model: Attendance,
          as: 'attendances',
          include: [{
            model: User,
            as: 'student',
            attributes: ['name', 'student_no', 'email']
          }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    // Prepare data for Excel
    const data = session.attendances.map((att, index) => ({
      '#': index + 1,
      'Student Name': att.student.name,
      'Student No': att.student.student_no,
      'Email': att.student.email,
      'Type': att.type,
      'Marked At': new Date(att.createdAt).toLocaleString('tr-TR')
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const wscols = [
      { wch: 5 },  // #
      { wch: 25 }, // Name
      { wch: 15 }, // Student No
      { wch: 30 }, // Email
      { wch: 10 }, // Type
      { wch: 20 }  // Marked At
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    const filename = `Attendance_${session.class.code}_${new Date(session.start_time).toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buf);
  } catch (error) {
    logger.error('Export Excel error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

// Export attendance as PDF for specific session
router.get('/session/:sessionId/pdf', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const teacherId = req.user.id;

    // Get session with attendances
    const session = await Session.findByPk(sessionId, {
      include: [
        {
          model: Class,
          as: 'class',
          where: { teacher_id: teacherId },
          include: [{
            model: User,
            as: 'teacher',
            attributes: ['name', 'email']
          }]
        },
        {
          model: Attendance,
          as: 'attendances',
          include: [{
            model: User,
            as: 'student',
            attributes: ['name', 'student_no', 'email']
          }],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    const filename = `Attendance_${session.class.code}_${new Date(session.start_time).toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Attendance Report', { align: 'center' });
    doc.moveDown();

    // Session info
    doc.fontSize(12);
    doc.text(`Class: ${session.class.name} (${session.class.code})`);
    doc.text(`Teacher: ${session.class.teacher.name}`);
    doc.text(`Session Date: ${new Date(session.start_time).toLocaleString('tr-TR')}`);
    doc.text(`Total Present: ${session.attendances.length}`);
    doc.moveDown();

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    const startY = doc.y;
    doc.text('#', 50, startY, { width: 30 });
    doc.text('Student Name', 80, startY, { width: 150 });
    doc.text('Student No', 230, startY, { width: 80 });
    doc.text('Type', 310, startY, { width: 60 });
    doc.text('Time', 370, startY, { width: 150 });

    doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
    doc.moveDown();

    // Table rows
    doc.font('Helvetica');
    session.attendances.forEach((att, index) => {
      const currentY = doc.y;

      // Check for page break
      if (currentY > 700) {
        doc.addPage();
        // Repeat header on new page
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('#', 50, 50, { width: 30 });
        doc.text('Student Name', 80, 50, { width: 150 });
        doc.text('Student No', 230, 50, { width: 80 });
        doc.text('Type', 310, 50, { width: 60 });
        doc.text('Time', 370, 50, { width: 150 });
        doc.moveTo(50, 65).lineTo(550, 65).stroke();
        doc.font('Helvetica').moveDown();
      }

      const y = doc.y;
      doc.text((index + 1).toString(), 50, y, { width: 30 });
      doc.text(att.student.name, 80, y, { width: 150 });
      doc.text(att.student.student_no || '-', 230, y, { width: 80 });
      doc.text(att.type, 310, y, { width: 60 });
      doc.text(new Date(att.createdAt).toLocaleTimeString('tr-TR'), 370, y, { width: 150 });
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text(`Generated on ${new Date().toLocaleString('tr-TR')}`, { align: 'center' });
    doc.text('University Attendance System', { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (error) {
    logger.error('Export PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Export failed' });
    }
  }
});

// Export class attendance summary as Excel
router.get('/class/:classId/excel', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    // Verify ownership
    const classObj = await Class.findOne({
      where: { id: classId, teacher_id: teacherId }
    });

    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found or unauthorized' });
    }

    // Get all sessions and attendances
    const students = await sequelize.query(
      `SELECT u.id, u.name, u.student_no, u.email,
              COUNT(DISTINCT s.id) as total_sessions,
              COUNT(a.id) as attended_sessions,
              ROUND((COUNT(a.id) / COUNT(DISTINCT s.id)) * 100, 2) as attendance_rate
       FROM users u
       INNER JOIN student_enrollments se ON u.id = se.student_id
       CROSS JOIN (SELECT id FROM sessions WHERE class_id = ?) s
       LEFT JOIN attendances a ON u.id = a.student_id AND s.id = a.session_id
       WHERE se.class_id = ? AND se.status = 'approved'
       GROUP BY u.id
       ORDER BY u.name ASC`,
      {
        replacements: [classId, classId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Prepare data
    const data = students.map((student, index) => ({
      '#': index + 1,
      'Student Name': student.name,
      'Student No': student.student_no,
      'Email': student.email,
      'Total Sessions': student.total_sessions,
      'Attended': student.attended_sessions,
      'Attendance Rate (%)': student.attendance_rate
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto-size columns
    const wscols = [
      { wch: 5 },  // #
      { wch: 25 }, // Name
      { wch: 15 }, // Student No
      { wch: 30 }, // Email
      { wch: 15 }, // Total Sessions
      { wch: 10 }, // Attended
      { wch: 18 }  // Attendance Rate
    ];
    ws['!cols'] = wscols;

    XLSX.utils.book_append_sheet(wb, ws, 'Summary');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Set headers
    const filename = `Class_Summary_${classObj.code}_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buf);
  } catch (error) {
    logger.error('Export class Excel error:', error);
    res.status(500).json({ success: false, message: 'Export failed' });
  }
});

module.exports = router;
