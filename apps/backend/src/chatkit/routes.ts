/**
 * ChatKit routes registration
 */

import type { FastifyInstance } from 'fastify';
import { handleChatKitBootstrap } from './bootstrap.js';
import { handleChatKitSession } from './session.js';
import { registerChatKitWebSocket } from './websocket.js';

export async function registerChatKitRoutes(server: FastifyInstance) {
  // ChatKit session creation endpoint (required for OpenAI ChatKit)
  server.post('/api/chatkit/session', handleChatKitSession);

  // Bootstrap endpoint for ChatKit initialization
  server.get('/session/bootstrap', handleChatKitBootstrap);

  // WebSocket endpoint for real-time messaging
  await registerChatKitWebSocket(server);

  server.log.info('ChatKit routes registered');
}
