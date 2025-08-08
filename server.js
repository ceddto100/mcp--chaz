import fastify from 'fastify';
import dotenv from 'dotenv';

// Import routes
import healthRoutes from './routes/health.js';
import mcpRoutes from './routes/mcp.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Fastify with logger
const server = fastify({
  logger: true,
});

// Register routes
server.register(healthRoutes, { prefix: '/health' });
server.register(mcpRoutes, { prefix: '/mcp' });

// Default route
server.get('/', async (request, reply) => {
  return { message: 'Welcome to the MCP Server!' };
});

// Start the server
const start = async () => {
  try {
    // Google Cloud Run provides the PORT env var. Default to 8080 for local dev.
    const port = process.env.PORT || 8080;
    // Listen on all network interfaces, important for containerized environments.
    await server.listen({ port: port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
