import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';

// Backend API base URL (change for production)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const API_SECRET = process.env.AGENTKIT_API_SECRET || 'your_secret_here';

// Create MCP server
const server = new McpServer({
  name: 'blunote-lti-companion',
  version: '1.0.0',
});

// Helper function to call backend endpoints
async function callBackendAPI(endpoint: string, data: any) {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/agentkit/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return response.data;
  } catch (error: any) {
    console.error(`Error calling ${endpoint}:`, error.message);
    throw new Error(`Backend API error: ${error.response?.data?.message || error.message}`);
  }
}

// Register all tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'track_confusion',
        description: 'Record a confusion event when a student clicks the "I\'m Confused" button',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'The student\'s unique identifier from the LMS' },
            course_id: { type: 'string', description: 'The course identifier' },
            slide_id: { type: 'string', description: 'The current slide/content identifier (optional)' },
            topic: { type: 'string', description: 'The topic or section name (optional)' },
            timestamp: { type: 'string', description: 'ISO8601 timestamp of the confusion event' },
          },
          required: ['user_id', 'course_id', 'timestamp'],
        },
      },
      {
        name: 'submit_question',
        description: 'Save a student\'s question to the database',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'The student\'s user ID (null if anonymous)' },
            course_id: { type: 'string', description: 'The course identifier' },
            question_body: { type: 'string', description: 'The full text of the student\'s question' },
            anonymous: { type: 'boolean', description: 'Whether the question should be anonymous (default: true)' },
            slide_id: { type: 'string', description: 'The slide/content the question relates to (optional)' },
            topic: { type: 'string', description: 'The topic the question relates to (optional)' },
          },
          required: ['course_id', 'question_body'],
        },
      },
      {
        name: 'generate_quiz',
        description: 'Generate a personalized quiz for a student based on their confusion zones',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'The student\'s user ID' },
            course_id: { type: 'string', description: 'The course identifier' },
            focus: {
              type: 'string',
              enum: ['confusion-zones', 'recent-topics', 'comprehensive', 'specific-topic'],
              description: 'What the quiz should focus on'
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'hard', 'adaptive'],
              description: 'Quiz difficulty level (default: adaptive)'
            },
            num_questions: { type: 'number', description: 'Number of questions to generate (default: 5)' },
            topics: { type: 'array', items: { type: 'string' }, description: 'Specific topics to include (optional)' },
          },
          required: ['user_id', 'course_id', 'focus'],
        },
      },
      {
        name: 'explain_topic',
        description: 'Generate a re-explanation of a topic that a student is confused about',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'The student\'s user ID' },
            course_id: { type: 'string', description: 'The course identifier' },
            topic: { type: 'string', description: 'The specific topic to explain' },
            explanation_style: {
              type: 'string',
              enum: ['simple', 'detailed', 'example-based', 'visual', 'analogy'],
              description: 'How to approach the explanation (default: simple)'
            },
            prior_confusion: { type: 'boolean', description: 'Whether student has been confused about this topic before' },
          },
          required: ['user_id', 'course_id', 'topic'],
        },
      },
      {
        name: 'fetch_notes',
        description: 'Retrieve course notes for a specific slide, topic, or section',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: 'The student\'s user ID' },
            course_id: { type: 'string', description: 'The course identifier' },
            slide_id: { type: 'string', description: 'The slide identifier (optional)' },
            topic: { type: 'string', description: 'The topic to retrieve notes for (optional)' },
            section: { type: 'string', description: 'The course section (optional)' },
            include_personal_notes: { type: 'boolean', description: 'Whether to include student\'s personal notes (default: true)' },
          },
          required: ['user_id', 'course_id'],
        },
      },
      {
        name: 'get_confusion_heatmap',
        description: 'Fetch confusion metrics aggregated by slide/topic for the instructor dashboard',
        inputSchema: {
          type: 'object',
          properties: {
            course_id: { type: 'string', description: 'The course identifier' },
            time_range: {
              type: 'string',
              enum: ['last_hour', 'today', 'this_week', 'this_month', 'all_time'],
              description: 'Time range for confusion data (default: today)'
            },
            group_by: {
              type: 'string',
              enum: ['slide', 'topic', 'section', 'lecture'],
              description: 'How to group the data (default: slide)'
            },
            include_trends: { type: 'boolean', description: 'Whether to include trend analysis (default: true)' },
          },
          required: ['course_id'],
        },
      },
      {
        name: 'export_confusion_data',
        description: 'Export confusion tracking data as CSV or JSON for instructor analysis',
        inputSchema: {
          type: 'object',
          properties: {
            course_id: { type: 'string', description: 'The course identifier' },
            format: { type: 'string', enum: ['csv', 'json'], description: 'Export format (default: csv)' },
            time_range: { type: 'string', description: 'Time range for export (e.g., "last_week", "this_month")' },
            include_anonymous: { type: 'boolean', description: 'Whether to include anonymized student data (default: true)' },
            include_metadata: { type: 'boolean', description: 'Whether to include slide/topic metadata (default: true)' },
          },
          required: ['course_id', 'format'],
        },
      },
      {
        name: 'notify_students_via_lms',
        description: 'Send notifications to students through the LMS messaging system',
        inputSchema: {
          type: 'object',
          properties: {
            course_id: { type: 'string', description: 'The course identifier' },
            recipient_filter: {
              type: 'string',
              enum: ['confused_students', 'all_students', 'struggling_students', 'specific_users'],
              description: 'Which students to notify'
            },
            user_ids: { type: 'array', items: { type: 'string' }, description: 'Specific user IDs to notify (if recipient_filter is "specific_users")' },
            subject: { type: 'string', description: 'Notification subject line' },
            message: { type: 'string', description: 'The notification message content' },
            include_resources: { type: 'boolean', description: 'Whether to include helpful resource links (default: true)' },
          },
          required: ['course_id', 'recipient_filter', 'subject', 'message'],
        },
      },
      {
        name: 'assign_remedial_quiz',
        description: 'Create and assign remedial quizzes to students who are confused',
        inputSchema: {
          type: 'object',
          properties: {
            course_id: { type: 'string', description: 'The course identifier' },
            quiz_type: {
              type: 'string',
              enum: ['remedial', 'practice', 'assessment'],
              description: 'Type of quiz to assign'
            },
            target_students: {
              type: 'string',
              enum: ['confused_students', 'all_students', 'specific_users'],
              description: 'Who to assign the quiz to'
            },
            user_ids: { type: 'array', items: { type: 'string' }, description: 'Specific user IDs (if target_students is "specific_users")' },
            topics: { type: 'array', items: { type: 'string' }, description: 'Topics to cover in the quiz' },
            due_date: { type: 'string', description: 'ISO8601 due date for the quiz (optional)' },
            passing_score: { type: 'number', description: 'Minimum score to pass (default: 70)' },
          },
          required: ['course_id', 'quiz_type', 'target_students', 'topics'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'track_confusion':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('track_confusion', args)) }] };

    case 'submit_question':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('submit_question', args)) }] };

    case 'generate_quiz':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('generate_quiz', args)) }] };

    case 'explain_topic':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('explain_topic', args)) }] };

    case 'fetch_notes':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('fetch_notes', args)) }] };

    case 'get_confusion_heatmap':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('get_confusion_heatmap', args)) }] };

    case 'export_confusion_data':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('export_confusion_data', args)) }] };

    case 'notify_students_via_lms':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('notify_students_via_lms', args)) }] };

    case 'assign_remedial_quiz':
      return { content: [{ type: 'text', text: JSON.stringify(await callBackendAPI('assign_remedial_quiz', args)) }] };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('BluNote LTI MCP server running');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
