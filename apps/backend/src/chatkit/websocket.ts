/**
 * ChatKit WebSocket handler
 * Real-time messaging between ChatKit frontend and AgentKit backend
 */

import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import { getAgent } from '../agentkit/agent.js';

interface WebSocketMessage {
  type: 'message' | 'ping' | 'action';
  sessionId: string;
  payload: unknown;
}

interface UserMessage {
  text: string;
}

interface ActionPayload {
  action: 'study_plan' | 'reflection' | 'insights';
  params?: Record<string, unknown>;
}

/**
 * Register WebSocket route for ChatKit streaming
 */
export async function registerChatKitWebSocket(server: FastifyInstance) {
  server.get('/session/live', { websocket: true }, (connection, request) => {
    const ws = connection.socket;

    request.log.info('ChatKit WebSocket connected');

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        switch (message.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;

          case 'message':
            await handleUserMessage(ws, message.sessionId, message.payload as UserMessage);
            break;

          case 'action':
            await handleAction(ws, message.sessionId, message.payload as ActionPayload);
            break;

          default:
            ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
        }
      } catch (error) {
        request.log.error({ error }, 'WebSocket message handling error');
        ws.send(
          JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        );
      }
    });

    ws.on('close', () => {
      request.log.info('ChatKit WebSocket disconnected');
    });

    ws.on('error', (error) => {
      request.log.error({ error }, 'ChatKit WebSocket error');
    });
  });

  server.log.info('ChatKit WebSocket route registered');
}

/**
 * Handle user message from ChatKit
 * Routes to AgentKit and streams response back
 */
async function handleUserMessage(ws: WebSocket, sessionId: string, payload: UserMessage) {
  try {
    const agent = getAgent();

    // Send acknowledgment
    ws.send(
      JSON.stringify({
        type: 'message_received',
        timestamp: Date.now(),
      })
    );

    // Process through AgentKit
    const result = await agent.processMessage({
      sessionId,
      message: payload.text,
    });

    // Stream response back to ChatKit
    ws.send(
      JSON.stringify({
        type: 'message',
        sender: 'assistant',
        text: result.response,
        toolsUsed: result.toolsUsed,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to process message',
      })
    );
  }
}

/**
 * Handle action triggers from ChatKit
 * (Study plan, reflection, insights buttons)
 */
async function handleAction(ws: WebSocket, sessionId: string, payload: ActionPayload) {
  try {
    const agent = getAgent();

    // Map action to AgentKit prompt
    let prompt = '';
    switch (payload.action) {
      case 'study_plan':
        prompt = 'Generate a personalized study plan for me based on my course progress.';
        break;
      case 'reflection':
        prompt = 'Help me write a reflective journal entry about what I learned today.';
        break;
      case 'insights':
        prompt = 'Show me insights and recommendations based on my learning activity.';
        break;
    }

    const result = await agent.processMessage({ sessionId, message: prompt });

    ws.send(
      JSON.stringify({
        type: 'action_result',
        action: payload.action,
        text: result.response,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    ws.send(
      JSON.stringify({
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to process action',
      })
    );
  }
}
