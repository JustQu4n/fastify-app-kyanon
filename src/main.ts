import Fastify from 'fastify';

import { userRoutes } from './routes/user.route';

const app = Fastify({
  logger: true,
});

app.get('/', async () => {
  return {
    success: true,
    message: 'Fastify API is running',
  };
});

app.register(userRoutes, { prefix: '/api/users' });

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);

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
    app.log.info('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error('Error starting server:', err);
});
