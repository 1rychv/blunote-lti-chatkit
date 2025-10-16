import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import 'dotenv/config';

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  },
});

// Register plugins
await server.register(cors, {
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true,
});

await server.register(websocket);

// Health check
server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Initialize AgentKit agent
import { initializeAgent } from './agentkit/agent.js';
import { registerLTIRoutes } from './lti/routes.js';
import { registerChatKitRoutes } from './chatkit/routes.js';

initializeAgent({
  agentId: process.env.AGENTKIT_AGENT_ID || 'blunote_companion',
  apiKey: process.env.AGENTKIT_API_KEY || '',
  workspaceId: process.env.AGENTKIT_WORKSPACE_ID || '',
});

// Register LTI routes
await registerLTIRoutes(server);

// Register ChatKit routes
await registerChatKitRoutes(server);

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

try {
  await server.listen({ port: PORT, host: HOST });
  server.log.info(`🚀 BluNote LTI backend listening on http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
