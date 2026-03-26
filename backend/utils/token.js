const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');
const logger = require('../config/logger');

// Redis key prefixes
const TOKEN_PREFIX = 'qr_token:';
const SESSION_TOKENS_PREFIX = 'session_tokens:';

/**
 * Generate short QR token (8 characters, alphanumeric)
 * Stores in Redis with configurable expiry
 */
async function generateQRToken(sessionId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars (I,1,O,0)
  let token = '';

  // Generate random 8-character token
  for (let i = 0; i < 8; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    token += chars[randomIndex];
  }

  try {
    const expiryMs = parseInt(process.env.QR_TOKEN_EXPIRY) || 30000;
    const tokenData = {
      sessionId,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiryMs
    };

    // Store token in Redis with expiry (convert ms to seconds)
    const tokenKey = TOKEN_PREFIX + token;
    const ttlSeconds = Math.ceil(expiryMs / 1000);

    await redisClient.setex(
      tokenKey,
      ttlSeconds,
      JSON.stringify(tokenData)
    );

    // Also add to session's token set (for cleanup tracking)
    const sessionTokensKey = SESSION_TOKENS_PREFIX + sessionId;
    await redisClient.sadd(sessionTokensKey, token);
    await redisClient.expire(sessionTokensKey, 3600); // Keep session tokens for 1 hour

    logger.debug(`Generated QR token for session ${sessionId}: ${token}`);

    return token;
  } catch (error) {
    logger.error('Redis error in generateQRToken:', error);
    // Return token anyway (will fail on verification if Redis is down)
    return token;
  }
}

/**
 * Verify QR token
 * Checks Redis for token validity
 */
async function verifyQRToken(token) {
  try {
    const tokenKey = TOKEN_PREFIX + token;
    const tokenDataStr = await redisClient.get(tokenKey);

    if (!tokenDataStr) {
      return { valid: false, reason: 'Invalid or expired token' };
    }

    const tokenData = JSON.parse(tokenDataStr);

    // Check if token is expired (double check)
    if (Date.now() > tokenData.expiresAt) {
      await redisClient.del(tokenKey);
      return { valid: false, reason: 'Token expired' };
    }

    return {
      valid: true,
      data: {
        sessionId: tokenData.sessionId,
        timestamp: tokenData.timestamp
      }
    };
  } catch (error) {
    logger.error('Redis error in verifyQRToken:', error);
    return { valid: false, reason: 'Token verification failed' };
  }
}

/**
 * Clean up all tokens for a session
 * Called when session ends
 */
async function cleanupSessionTokens(sessionId) {
  try {
    const sessionTokensKey = SESSION_TOKENS_PREFIX + sessionId;
    const tokens = await redisClient.smembers(sessionTokensKey);

    // Delete all tokens
    const deletePromises = tokens.map(token =>
      redisClient.del(TOKEN_PREFIX + token)
    );
    await Promise.all(deletePromises);

    // Delete the session tokens set
    await redisClient.del(sessionTokensKey);

    logger.info(`Cleaned up ${tokens.length} tokens for session ${sessionId}`);
  } catch (error) {
    logger.error('Redis error in cleanupSessionTokens:', error);
  }
}

/**
 * Generate device fingerprint
 * SHA-256 hash of IP + User-Agent
 */
function generateDeviceFingerprint(ip, userAgent) {
  const hash = crypto
    .createHash('sha256')
    .update(ip + userAgent)
    .digest('hex');
  return hash;
}

/**
 * Check if Redis is connected
 */
async function isRedisConnected() {
  try {
    const status = redisClient.status;
    return status === 'ready' || status === 'connect';
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateQRToken,
  verifyQRToken,
  cleanupSessionTokens,
  generateDeviceFingerprint,
  isRedisConnected
};
