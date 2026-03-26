const Redis = require('ioredis');
const logger = require('./logger');

// Redis client configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB) || 0,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
};

// Create Redis client
const redisClient = new Redis(redisConfig);

// Event handlers
redisClient.on('connect', () => {
  logger.info('✅ Redis client connected successfully');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client ready to accept commands');
});

redisClient.on('error', (err) => {
  logger.error('❌ Redis client error:', err);
});

redisClient.on('close', () => {
  logger.warn('⚠️ Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('🔄 Redis client reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing Redis connection...');
  await redisClient.quit();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing Redis connection...');
  await redisClient.quit();
});

module.exports = redisClient;
