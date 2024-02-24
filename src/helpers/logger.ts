import winston from 'winston';
import { getDirname } from '../utils';
import path from 'node:path';

export const logger = winston.createLogger({
  level: 'verbose',
  transports: [
    new winston.transports.File({
      filename: path.resolve(getDirname(), 'logs', 'error.log'),
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      // only verbose logs
      level: 'verbose',
      // ignore all logs above verbose
      tailable: true,
      silent: process.env.NODE_ENV === 'production',
      filename: path.resolve(getDirname(), 'logs', 'verbose.log'),
      format: winston.format.printf(({ message }) => {
        // convert to local time
        const date = new Date().toLocaleString();
        return `${date} : ${message}`;
      }),
    }),
  ],
});
