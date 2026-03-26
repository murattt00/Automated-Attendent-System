const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = process.env.LOG_FILE_PATH || path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey'
};

winston.addColors(colors);

// Define log format for files (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log format for console (readable)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, ...meta } = info;
      let msg = `${timestamp} [${level}]: ${message}`;

      // Add stack trace for errors
      if (info.stack) {
        msg += `\n${info.stack}`;
      }

      // Add metadata if exists
      if (Object.keys(meta).length > 0 && meta.stack === undefined) {
        msg += ` ${JSON.stringify(meta)}`;
      }

      return msg;
    }
  )
);

// Daily Rotate File Transport for errors
const errorRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  format: fileFormat,
  zippedArchive: true
});

// Daily Rotate File Transport for all logs
const combinedRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '30d',
  format: fileFormat,
  zippedArchive: true
});

// Daily Rotate File Transport for HTTP logs (access logs)
const httpRotateTransport = new DailyRotateFile({
  filename: path.join(logDir, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  format: fileFormat,
  zippedArchive: true
});

// Define transports array
const transports = [
  errorRotateTransport,
  combinedRotateTransport,
  httpRotateTransport
];

// Add console transport only in development or if explicitly enabled
if (process.env.NODE_ENV !== 'production' || process.env.LOG_CONSOLE === 'true') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug'
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false,

  // Exception handling
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  ],

  // Rejection handling (unhandled promise rejections)
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat
    })
  ]
});

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Log on rotate events
errorRotateTransport.on('rotate', (oldFilename, newFilename) => {
  logger.info(`Log rotated: ${oldFilename} -> ${newFilename}`);
});

// Log on archive events
errorRotateTransport.on('archive', (zipFilename) => {
  logger.info(`Log archived: ${zipFilename}`);
});

// Export logger
module.exports = logger;
