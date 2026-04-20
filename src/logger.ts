import { createLogger, format, transports } from 'winston';

const ALLOWED_LOG_LEVELS = new Set([
  'error',
  'warn',
  'info',
  'http',
  'verbose',
  'debug',
  'silly',
]);

function getDefaultLogLevel(): string {
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

function getLogLevel(): string {
  const value = process.env.LOG_LEVEL?.toLowerCase();

  if (value && ALLOWED_LOG_LEVELS.has(value)) {
    return value;
  }

  return getDefaultLogLevel();
}

export const logger = createLogger({
  level: getLogLevel(),
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: 'fastify-api' },
  transports: [new transports.Console()],
});
