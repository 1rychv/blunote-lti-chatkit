/**
 * ChatKit session bootstrap handler
 * Returns configuration and initial state for ChatKit frontend
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ChatKitBootstrap } from '@blunote/shared';

/**
 * Bootstrap ChatKit session
 * Called by frontend on initial load to get session config
 */
export async function handleChatKitBootstrap(
  request: FastifyRequest<{ Querystring: { sessionId: string } }>,
  reply: FastifyReply
) {
  const { sessionId } = request.query;

  if (!sessionId) {
    return reply.status(400).send({ error: 'Missing sessionId parameter' });
  }

  // TODO: Load LTI session from Supabase
  // TODO: Load AgentKit session
  // TODO: Load conversation history

  // Mock bootstrap data for now
  const bootstrap: ChatKitBootstrap = {
    session: {
      sessionId,
      conversationId: `conv_${sessionId}`,
      userId: 'user_123',
      userName: 'Student',
      courseId: 'course_456',
      courseName: 'Introduction to Computer Science',
      role: 'Learner',
      agentId: process.env.AGENTKIT_AGENT_ID || 'blunote_companion',
    },
    initialMessages: [
      {
        id: 'msg_welcome',
        text: 'Hello! I\'m your BluNote assistant. How can I help you study today?',
        sender: 'assistant',
        timestamp: new Date(),
      },
    ],
    features: {
      studyPlan: true,
      reflection: true,
      insights: true,
      gradeSubmission: false, // Instructor-only
    },
    wsUrl: process.env.WS_URL || 'ws://localhost:4000/session/live',
  };

  request.log.info({ sessionId }, 'ChatKit bootstrap successful');

  return reply.send(bootstrap);
}
