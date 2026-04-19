import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, label, timestamp }) =>
    `${timestamp} ${level.padEnd(7)} [${label}] - ${message}`
);

export function createLogger(name: string): winston.Logger {
    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            align(),
            winston.format.label({ label: name }),
            logFormat
        ),
        transports: [new winston.transports.Console()],
    });
}