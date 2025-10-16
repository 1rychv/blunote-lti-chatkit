/**
 * ChatKit session creation endpoint
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatKitSessionBody {
  userId?: string;
  courseId?: string;
  role?: string;
}

export async function handleChatKitSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const body = request.body as ChatKitSessionBody;
    const { userId, courseId, role } = body || {};

    // Create ChatKit session with OpenAI
    const session = await openai.chatkit.sessions.create({
      workflow_id: process.env.CHATKIT_WORKFLOW_ID,
      // Pass LTI context as metadata
      metadata: {
        user_id: userId || 'anonymous',
        course_id: courseId || '',
        role: role || 'Learner',
      },
    });

    return reply.send({
      client_secret: session.client_secret,
    });
  } catch (error) {
    request.log.error(error, 'Failed to create ChatKit session');
    return reply.status(500).send({
      error: 'Failed to create ChatKit session',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
