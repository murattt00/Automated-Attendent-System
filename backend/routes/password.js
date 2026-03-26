const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models');
const { sendPasswordResetEmail } = require('../config/email');

// Store reset tokens in memory (in production, use Redis or database)
const resetTokens = new Map();

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Store token with expiry (1 hour)
    resetTokens.set(tokenHash, {
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + 3600000 // 1 hour
    });

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      // Don't reveal email sending failure to prevent enumeration
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Hash token to find it in storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = resetTokens.get(tokenHash);

    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      resetTokens.delete(tokenHash);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please request a new one'
      });
    }

    // Find user
    const user = await User.findByPk(tokenData.userId);

    if (!user) {
      resetTokens.delete(tokenHash);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await user.update({ password: hashedPassword });

    // Delete used token
    resetTokens.delete(tokenHash);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Verify reset token (optional endpoint to check if token is valid)
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = resetTokens.get(tokenHash);

    if (!tokenData || Date.now() > tokenData.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify token'
    });
  }
});

module.exports = router;
