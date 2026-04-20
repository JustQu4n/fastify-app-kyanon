import Fastify from 'fastify';

import { logger } from './logger';
import { healthCheckRoute, userRoutes } from './routes/user.route';

const requestStartTime = new WeakMap<object, bigint>();

const SENSITIVE_HEADERS = new Set(['authorization', 'cookie']);

function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const sanitizedHeaders: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(headers)) {
    sanitizedHeaders[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }

  return sanitizedHeaders;
}

const app = Fastify({
  logger: false,
});

app.addHook('onRequest', async (request) => {
  requestStartTime.set(request, process.hrtime.bigint());

  logger.info('Incoming request', {
    requestId: request.id,
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    headers: sanitizeHeaders(request.headers as Record<string, unknown>),
  });
});

app.addHook('onResponse', async (request, reply) => {
  const startTime = requestStartTime.get(request);
  const durationMs = startTime ? Number(process.hrtime.bigint() - startTime) / 1_000_000 : undefined;

  logger.info('Request completed', {
    requestId: request.id,
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    durationMs,
  });
});

app.get('/', async () => {
  return {
    success: true,
    message: 'Fastify API is running',
  };
});

app.register(userRoutes, { prefix: '/api/users' });
app.register(healthCheckRoute);

app.setErrorHandler((error, request, reply) => {
  logger.error('Request failed', {
    requestId: request.id,
    method: request.method,
    url: request.url,
    error,
  });

  if (reply.sent) {
    return;
  }

  const statusCode = getStatusCode(error);
  const message = error instanceof Error ? error.message : 'Internal server error';

  reply.status(statusCode).send({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : message,
  });
});

function getStatusCode(error: unknown): number {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const value = (error as { statusCode?: unknown }).statusCode;

    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }
  }

  return 500;
}

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    logger.info('Server is running', { port: 3000 });
  } catch (err) {
    logger.error('Server startup failed', { error: err });
    process.exit(1);
  }
};

start().catch((err) => {
  console.error('Error starting server:', err);
});
