const express = require('express');
const { Class, User, sequelize } = require('../models');
const { authMiddleware, studentOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { enrollSchema, unenrollSchema } = require('../validators/enrollment');
const router = express.Router();

// Get available classes for student to enroll
router.get('/available', authMiddleware, studentOnly, async (req, res) => {
  try {
    // Get all classes
    const allClasses = await Class.findAll({
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }],
      order: [['name', 'ASC']]
    });

    // Get student's enrolled classes
    const enrolledClasses = await sequelize.query(
      'SELECT class_id FROM student_enrollments WHERE student_id = ?',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    const enrolledIds = enrolledClasses.map(e => e.class_id);

    // Filter out already enrolled classes
    const available = allClasses.filter(c => !enrolledIds.includes(c.id));

    res.json({
      success: true,
      data: { classes: available }
    });
  } catch (error) {
    console.error('Get available classes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get student's enrolled classes
router.get('/enrolled', authMiddleware, studentOnly, async (req, res) => {
  try {
    const enrolledClasses = await sequelize.query(
      `SELECT c.*, t.name as teacher_name, t.email as teacher_email
       FROM classes c
       INNER JOIN student_enrollments se ON c.id = se.class_id
       LEFT JOIN users t ON c.teacher_id = t.id
       WHERE se.student_id = ?
       ORDER BY c.name ASC`,
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      data: { classes: enrolledClasses }
    });
  } catch (error) {
    console.error('Get enrolled classes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Enroll in a class
router.post('/enroll', authMiddleware, studentOnly, validate(enrollSchema), async (req, res) => {
  try {
    const { class_id } = req.body;

    // Check if class exists
    const classObj = await Class.findByPk(class_id);
    if (!classObj) {
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    // Check if already enrolled
    const [existing] = await sequelize.query(
      'SELECT * FROM student_enrollments WHERE student_id = ? AND class_id = ?',
      {
        replacements: [req.user.id, class_id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already enrolled in this class' 
      });
    }

    // Enroll student
    await sequelize.query(
      'INSERT INTO student_enrollments (student_id, class_id, enrolled_at) VALUES (?, ?, NOW())',
      {
        replacements: [req.user.id, class_id],
        type: sequelize.QueryTypes.INSERT
      }
    );

    res.json({
      success: true,
      message: 'Successfully enrolled in class'
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Unenroll from a class
router.post('/unenroll', authMiddleware, studentOnly, validate(unenrollSchema), async (req, res) => {
  try {
    const { class_id } = req.body;

    await sequelize.query(
      'DELETE FROM student_enrollments WHERE student_id = ? AND class_id = ?',
      {
        replacements: [req.user.id, class_id],
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.json({
      success: true,
      message: 'Successfully unenrolled from class'
    });
  } catch (error) {
    console.error('Unenroll error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
