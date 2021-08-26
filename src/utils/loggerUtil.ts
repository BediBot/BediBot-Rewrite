const winston = require('winston');
const errorLogsPath = './logs/error.log';
const allLogsPath = './logs/combined.log';

const logFormat = winston.format.combine(
    winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.printf(
        (info: {timestamp: string; level: string; message: string;}) =>
            `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`,
        ),
);

const logConfig = {
        format: logFormat,
        'transports': [
                new winston.transports.Console({
                        level: process.env.LOG_LEVEL,
                        format: winston.format.combine(
                            logFormat,
                            winston.format.colorize({
                                    all: true,
                            }),
                            ),
                }),
                new winston.transports.File({
                        filename: errorLogsPath,
                        level: 'error',
                }),
                new winston.transports.File({
                        filename: allLogsPath,
                }),
        ],
};

const logger = winston.createLogger(logConfig);

export default logger;