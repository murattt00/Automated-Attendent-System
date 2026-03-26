const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Reset token
 * @param {string} userName - User's name
 */
async function sendPasswordResetEmail(to, resetToken, userName) {
  try {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    // Development mode: Log to console instead of sending email
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
      console.log('\n========================================');
      console.log('📧 PASSWORD RESET EMAIL (DEV MODE)');
      console.log('========================================');
      console.log(`To: ${to}`);
      console.log(`User: ${userName}`);
      console.log(`Reset Token: ${resetToken}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('========================================\n');
      
      return { success: true, devMode: true };
    }
    
    const mailOptions = {
      from: `"UniAttend" <${process.env.SMTP_USER}>`,
      to: to,
      subject: 'Password Reset Request - UniAttend',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🔒 Password Reset</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              
              <p>We received a request to reset your password for your UniAttend account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">
                ${resetLink}
              </p>
              
              <div class="warning">
                <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
                <p style="margin: 5px 0 0 0;">This link will expire in <strong>1 hour</strong>. If you didn't request this reset, please ignore this email or contact support if you have concerns.</p>
              </div>
              
              <p>Best regards,<br><strong>The UniAttend Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© 2026 UniAttend. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendPasswordResetEmail };
