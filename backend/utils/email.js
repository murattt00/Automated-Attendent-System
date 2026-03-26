const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Send email with error handling
const sendEmail = async (mailOptions) => {
  if (!isEmailConfigured()) {
    logger.warn('Email not configured. Skipping email send.');
    return { success: false, message: 'Email not configured' };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"University Attendance" <noreply@university.edu>',
      ...mailOptions
    });

    logger.info(`Email sent: ${info.messageId} to ${mailOptions.to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// ========================================
// EMAIL TEMPLATES
// ========================================

/**
 * Send session started notification to enrolled students
 */
const sendSessionStartedEmail = async (classInfo, sessionInfo, students) => {
  if (!isEmailConfigured() || process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  const emailPromises = students.map(student => {
    const mailOptions = {
      to: student.email,
      subject: `🔔 Session Started: ${classInfo.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Session Started!</h2>
          <p>Hi ${student.name},</p>
          <p>A new attendance session has started for your class:</p>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Class:</strong> ${classInfo.name} (${classInfo.code})</p>
            <p><strong>Started At:</strong> ${new Date(sessionInfo.start_time).toLocaleString('tr-TR')}</p>
            <p><strong>Teacher:</strong> ${classInfo.teacher_name}</p>
          </div>

          <p style="color: #e74c3c; font-weight: bold;">⏰ Don't forget to mark your attendance!</p>

          <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
            This is an automated message from University Attendance System.
          </p>
        </div>
      `
    };

    return sendEmail(mailOptions);
  });

  await Promise.allSettled(emailPromises);
};

/**
 * Send enrollment request notification to teacher
 */
const sendEnrollmentRequestEmail = async (teacherEmail, teacherName, studentInfo, classInfo) => {
  if (!isEmailConfigured() || process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  const mailOptions = {
    to: teacherEmail,
    subject: `📝 New Enrollment Request: ${classInfo.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">New Enrollment Request</h2>
        <p>Hi ${teacherName},</p>
        <p>A student has requested to enroll in your class:</p>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Student Information</h3>
          <p><strong>Name:</strong> ${studentInfo.name}</p>
          <p><strong>Student No:</strong> ${studentInfo.student_no}</p>
          <p><strong>Email:</strong> ${studentInfo.email}</p>

          <h3>Class Information</h3>
          <p><strong>Class:</strong> ${classInfo.name} (${classInfo.code})</p>
        </div>

        <p>Please review and approve/reject this request from your dashboard.</p>

        <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
          This is an automated message from University Attendance System.
        </p>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send enrollment approved notification to student
 */
const sendEnrollmentApprovedEmail = async (studentEmail, studentName, classInfo, teacherName) => {
  if (!isEmailConfigured() || process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  const mailOptions = {
    to: studentEmail,
    subject: `✅ Enrollment Approved: ${classInfo.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Enrollment Approved!</h2>
        <p>Hi ${studentName},</p>
        <p>Great news! Your enrollment request has been approved:</p>

        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <p><strong>Class:</strong> ${classInfo.name} (${classInfo.code})</p>
          <p><strong>Teacher:</strong> ${teacherName}</p>
        </div>

        <p>You can now participate in attendance sessions for this class.</p>

        <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
          This is an automated message from University Attendance System.
        </p>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send enrollment rejected notification to student
 */
const sendEnrollmentRejectedEmail = async (studentEmail, studentName, classInfo, reason) => {
  if (!isEmailConfigured() || process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  const mailOptions = {
    to: studentEmail,
    subject: `❌ Enrollment Not Approved: ${classInfo.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Enrollment Not Approved</h2>
        <p>Hi ${studentName},</p>
        <p>Unfortunately, your enrollment request was not approved:</p>

        <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
          <p><strong>Class:</strong> ${classInfo.name} (${classInfo.code})</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>

        <p>Please contact your teacher for more information.</p>

        <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
          This is an automated message from University Attendance System.
        </p>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

/**
 * Send weekly attendance summary to student
 */
const sendWeeklyAttendanceSummary = async (studentEmail, studentName, summary) => {
  if (!isEmailConfigured() || process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'true') {
    return;
  }

  const classRows = summary.classes.map(c => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${c.class_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${c.attended_sessions}/${c.total_sessions}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${c.attendance_rate}%</td>
    </tr>
  `).join('');

  const mailOptions = {
    to: studentEmail,
    subject: `📊 Weekly Attendance Summary`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Weekly Attendance Summary</h2>
        <p>Hi ${studentName},</p>
        <p>Here's your attendance summary for this week:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Class</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Attended</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Rate</th>
            </tr>
          </thead>
          <tbody>
            ${classRows}
          </tbody>
        </table>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Overall Attendance Rate:</strong> ${summary.overall_rate}%</p>
        </div>

        <p style="margin-top: 30px; color: #7f8c8d; font-size: 12px;">
          This is an automated message from University Attendance System.
        </p>
      </div>
    `
  };

  return sendEmail(mailOptions);
};

module.exports = {
  sendEmail,
  isEmailConfigured,
  sendSessionStartedEmail,
  sendEnrollmentRequestEmail,
  sendEnrollmentApprovedEmail,
  sendEnrollmentRejectedEmail,
  sendWeeklyAttendanceSummary
};
