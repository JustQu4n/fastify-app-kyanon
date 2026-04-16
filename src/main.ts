import Fastify from 'fastify';

const app = Fastify({
  logger: true,
});

app.get('/', async () => {
  return { message: 'Hello, Fastify!' };
});

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start().catch((err) => {
  console.error('Error starting server:', err);
});
