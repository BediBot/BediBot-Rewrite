const winston = require('winston');

const logFormat = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.printf(
        (info: { timestamp: string; level: string; message: string; }) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`,
    ),
);

const logConfig = {
  format: logFormat,
  'transports': [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
          logFormat,
          winston.format.colorize({
            all: true,
          }),
      ),
    }),
    new winston.transports.File({
      filename: './logs/error.log', level: 'error',
    }),
    new winston.transports.File({
      filename: './logs/combined.log',
    }),
  ],
};

const logger = winston.createLogger(logConfig);

export default logger;