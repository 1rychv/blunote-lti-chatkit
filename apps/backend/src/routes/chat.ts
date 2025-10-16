import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { runWorkflow, WorkflowInput } from '../agent/blunote-agent';

interface ChatRequest {
  message: string;
  user_id?: string;
  course_id?: string;
  role?: 'student' | 'instructor';
}

export default async function chatRoutes(fastify: FastifyInstance) {
  // POST /api/chat - Main chat endpoint
  fastify.post('/api/chat', async (request: FastifyRequest<{ Body: ChatRequest }>, reply: FastifyReply) => {
    const { message, user_id, course_id, role } = request.body;

    // Validate required fields
    if (!message) {
      return reply.status(400).send({
        success: false,
        error: 'Message is required'
      });
    }

    try {
      // Prepare workflow input
      const workflowInput: WorkflowInput = {
        input_as_text: message,
        user_id,
        course_id,
        role
      };

      // Run the agent workflow
      const result = await runWorkflow(workflowInput);

      return {
        success: true,
        response: result.output_text,
        tool_calls: result.tool_calls || []
      };
    } catch (error: any) {
      fastify.log.error('Error in chat endpoint:', error);

      return reply.status(500).send({
        success: false,
        error: error.message || 'Internal server error'
      });
    }
  });

  // GET /api/chat/health - Health check endpoint
  fastify.get('/api/chat/health', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      agent: 'BluNote Companion',
      functions: 9
    };
  });
}
