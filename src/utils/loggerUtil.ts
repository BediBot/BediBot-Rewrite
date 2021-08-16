import DiscordTransport from 'winston-discord-transport';

const winston = require('winston');
const errorLogsPath = './logs/error.log';
const allLogsPath = './logs/combined.log';

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
      filename: errorLogsPath, level: 'error',
    }),
    new winston.transports.File({
      filename: allLogsPath,
    }),
    new DiscordTransport({
      webhook: 'https://discord.com/api/webhooks/876877161867378728/Bm5MX6OzYS61rOgExwVH3gsceDjgEaM_al-Mz_TnDX4KSGp24-skJCg2UEIm56c_iAJi',
      defaultMeta: {service: 'Discord_Logging_Service'},
      level: 'info',
    }),
  ],
};

const logger = winston.createLogger(logConfig);

export default logger;