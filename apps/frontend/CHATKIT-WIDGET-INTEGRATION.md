# ChatKit Widget Integration Guide

## Overview

The Class Assist widget (`class-assist.widget`) provides a confusion tracking and study assistance interface that renders inside ChatKit conversations. This widget supports both student and instructor views with real-time data binding.

## Architecture

```
┌─────────────────┐
│  ChatKit UI     │ ← User clicks "I'm Confused"
│  (Widget)       │
└────────┬────────┘
         │ Widget Action
         ▼
┌─────────────────┐
│  AgentKit       │ ← Receives action, decides what to do
│  Workflow       │
└────────┬────────┘
         │ Calls Function
         ▼
┌─────────────────┐
│  Backend        │ ← Implements function (tracks to Supabase)
│  (Fastify)      │
└────────┬────────┘
         │ Returns Result
         ▼
┌─────────────────┐
│  AgentKit       │ ← Updates widget state
│  Workflow       │
└────────┬────────┘
         │ State Update
         ▼
┌─────────────────┐
│  ChatKit UI     │ ← Widget re-renders with new data
│  (Widget)       │
└─────────────────┘
```

**Key Point**: Widget actions are handled by **AgentKit workflow**, not directly by your backend. Your backend implements **functions** that AgentKit calls.

## Widget File Location

```
apps/frontend/src/widgets/class-assist.widget
```

## Integration Steps

### 1. Upload Widget to AgentKit Workflow

1. Navigate to [OpenAI Platform - Assistants](https://platform.openai.com/playground/assistants)
2. Open your workflow: `wf_68f098cbd02881909ef6081a835dd67d0e9da771c613a7e7`
3. Go to the "Widgets" tab
4. Click "Upload Widget" and select `class-assist.widget`
5. The widget will be registered as "Class Assist" in your workflow

### 2. Register Functions in AgentKit Workflow

Configure your AgentKit workflow to handle widget actions by registering functions (tools). In the OpenAI Platform workflow editor, add these function definitions:

#### Function Definitions for AgentKit

Add these functions to your workflow configuration:

```json
{
  "functions": [
    {
      "name": "track_confusion",
      "description": "Record a confusion event when student clicks 'I'm Confused' button",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "The student's user ID"
          },
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "slide_id": {
            "type": "string",
            "description": "Current slide/content identifier"
          },
          "timestamp": {
            "type": "string",
            "description": "ISO8601 timestamp of confusion event"
          }
        },
        "required": ["user_id", "course_id"]
      }
    },
    {
      "name": "submit_question",
      "description": "Save a student question to the database",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "The student's user ID"
          },
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "question_body": {
            "type": "string",
            "description": "The question text"
          },
          "anonymous": {
            "type": "boolean",
            "description": "Whether the question is anonymous"
          }
        },
        "required": ["user_id", "course_id", "question_body"]
      }
    },
    {
      "name": "generate_quiz",
      "description": "Generate a personalized quiz based on confusion zones",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "The student's user ID"
          },
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "focus": {
            "type": "string",
            "description": "Quiz focus area (e.g., 'confusion-zones', 'recent-topics')"
          }
        },
        "required": ["user_id", "course_id"]
      }
    },
    {
      "name": "explain_topic",
      "description": "Generate a re-explanation of a topic the student is confused about",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "The student's user ID"
          },
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "topic": {
            "type": "string",
            "description": "The topic to explain"
          }
        },
        "required": ["user_id", "course_id", "topic"]
      }
    },
    {
      "name": "fetch_notes",
      "description": "Retrieve notes for a specific slide or topic",
      "parameters": {
        "type": "object",
        "properties": {
          "user_id": {
            "type": "string",
            "description": "The student's user ID"
          },
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "slide_id": {
            "type": "string",
            "description": "The slide identifier"
          }
        },
        "required": ["user_id", "course_id"]
      }
    },
    {
      "name": "get_confusion_heatmap",
      "description": "Fetch confusion metrics by slide for instructor dashboard",
      "parameters": {
        "type": "object",
        "properties": {
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "time_range": {
            "type": "string",
            "description": "Time range for data (e.g., 'last_hour', 'today', 'this_week')"
          }
        },
        "required": ["course_id"]
      }
    },
    {
      "name": "export_confusion_data",
      "description": "Export confusion tracking data as CSV for instructor analysis",
      "parameters": {
        "type": "object",
        "properties": {
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "format": {
            "type": "string",
            "enum": ["csv", "json"],
            "description": "Export format"
          }
        },
        "required": ["course_id"]
      }
    },
    {
      "name": "notify_students_via_lms",
      "description": "Send notifications to confused students through the LMS",
      "parameters": {
        "type": "object",
        "properties": {
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "recipient_filter": {
            "type": "string",
            "enum": ["confused_students", "all_students", "struggling_students"],
            "description": "Which students to notify"
          },
          "message": {
            "type": "string",
            "description": "Notification message"
          }
        },
        "required": ["course_id", "recipient_filter", "message"]
      }
    },
    {
      "name": "assign_remedial_quiz",
      "description": "Create and assign remedial quizzes to students who are confused",
      "parameters": {
        "type": "object",
        "properties": {
          "course_id": {
            "type": "string",
            "description": "The course identifier"
          },
          "quiz_type": {
            "type": "string",
            "enum": ["remedial", "practice", "assessment"],
            "description": "Type of quiz to assign"
          },
          "topics": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Topics to cover in the quiz"
          }
        },
        "required": ["course_id", "quiz_type"]
      }
    }
  ]
}
```

### 3. Widget Actions → Function Mapping

When users interact with the widget, AgentKit will receive these actions and should call the corresponding functions:

| Widget Action | AgentKit Function | Description |
|---------------|-------------------|-------------|
| `confusion.ping` | `track_confusion` | Student reports confusion |
| `question.submit` | `submit_question` | Student submits question |
| `study.quiz` | `generate_quiz` | Generate personalized quiz |
| `study.explain` | `explain_topic` | Re-explain a topic |
| `study.notes` | `fetch_notes` | Retrieve notes |
| `heatmap.refresh` | `get_confusion_heatmap` | Refresh instructor dashboard |
| `intervention.export` | `export_confusion_data` | Export data as CSV |
| `intervention.notify` | `notify_students_via_lms` | Send LMS notifications |
| `intervention.assign` | `assign_remedial_quiz` | Assign quizzes |
| `view.set` | *(handled in widget state)* | UI-only, no function call |
| `ui.toggle` | *(handled in widget state)* | UI-only, no function call |

### 4. Initialize Widget State from Backend

When creating a ChatKit session, pass LTI context as initial widget state:

```typescript
// Backend: apps/backend/src/chatkit/session.ts
export async function handleChatKitSession(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as ChatKitSessionBody;
  const { userId, courseId, role } = body;

  // Fetch initial data for widget
  const improvement = await calculateImprovement(userId);
  const spike = await getConfusionSpike(courseId);
  const chartData = await getHeatmapData(courseId);

  const session = await openai.chatkit.sessions.create({
    workflow_id: process.env.CHATKIT_WORKFLOW_ID!,
    metadata: {
      user_id: userId,
      course_id: courseId,
      role: role,
    },
    widget_state: {
      'class-assist': {
        courseName: body.courseName || 'Course',
        view: role === 'Instructor' ? 'instructor' : 'student',
        viewOptions: [
          { value: 'student', label: 'Student view' },
          { value: 'instructor', label: 'Instructor view' },
        ],
        askOpen: false,
        metrics: {
          improvement: improvement,
        },
        spike: spike,
        chartData: chartData,
      },
    },
  });

  return reply.send({ client_secret: session.client_secret });
}
```

### 5. Implement Function Handlers in Backend

Create handlers for each function that AgentKit will call. These are **HTTP endpoints** that AgentKit invokes:

```typescript
// apps/backend/src/agentkit/functions.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../db/supabase';

export async function trackConfusion(request: FastifyRequest, reply: FastifyReply) {
  const { user_id, course_id, slide_id, timestamp } = request.body as any;

  // Save to Supabase
  const { data, error } = await supabase.from('confusion_events').insert({
    user_id,
    course_id,
    slide_id,
    timestamp: timestamp || new Date().toISOString(),
  });

  if (error) {
    return reply.code(500).send({ error: error.message });
  }

  // Check if threshold is exceeded
  const recentCount = await getRecentConfusionCount(course_id);
  const activeStudents = await getActiveStudentCount(course_id);
  const percentage = (recentCount / activeStudents) * 100;

  return reply.send({
    success: true,
    threshold_exceeded: percentage > 25,
    current_percentage: percentage,
  });
}

export async function submitQuestion(request: FastifyRequest, reply: FastifyReply) {
  const { user_id, course_id, question_body, anonymous } = request.body as any;

  const { data, error } = await supabase.from('questions').insert({
    user_id: anonymous ? null : user_id,
    course_id,
    question: question_body,
    anonymous,
    timestamp: new Date().toISOString(),
  });

  if (error) {
    return reply.code(500).send({ error: error.message });
  }

  return reply.send({
    success: true,
    message: 'Question submitted successfully',
  });
}

export async function generateQuiz(request: FastifyRequest, reply: FastifyReply) {
  const { user_id, course_id, focus } = request.body as any;

  // Fetch confusion zones for user
  const confusionTopics = await getUserConfusionTopics(user_id, course_id);

  // Generate quiz using OpenAI
  const quizContent = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a quiz generator. Create a 5-question quiz based on the topics provided.',
      },
      {
        role: 'user',
        content: `Generate a quiz for these topics: ${confusionTopics.join(', ')}`,
      },
    ],
  });

  return reply.send({
    quiz: quizContent.choices[0].message.content,
    topics: confusionTopics,
  });
}

// Register routes
export function registerAgentKitFunctions(server: FastifyInstance) {
  server.post('/api/agentkit/track_confusion', trackConfusion);
  server.post('/api/agentkit/submit_question', submitQuestion);
  server.post('/api/agentkit/generate_quiz', generateQuiz);
  server.post('/api/agentkit/explain_topic', explainTopic);
  server.post('/api/agentkit/fetch_notes', fetchNotes);
  server.post('/api/agentkit/get_confusion_heatmap', getConfusionHeatmap);
  server.post('/api/agentkit/export_confusion_data', exportConfusionData);
  server.post('/api/agentkit/notify_students_via_lms', notifyStudentsViaLMS);
  server.post('/api/agentkit/assign_remedial_quiz', assignRemedialQuiz);
}
```

### 6. Configure AgentKit Function Endpoints

In your AgentKit workflow configuration, specify the URLs where these functions are hosted:

```json
{
  "functions": [
    {
      "name": "track_confusion",
      "type": "http",
      "http": {
        "url": "https://your-backend-domain.com/api/agentkit/track_confusion",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer ${AGENTKIT_SECRET}"
        }
      },
      "parameters": { /* ... from step 2 ... */ }
    }
    // ... repeat for all functions
  ]
}
```

### 7. Update Widget State Dynamically

When your backend detects changes (e.g., confusion threshold exceeded), update the widget state via AgentKit:

```typescript
// Example: Real-time confusion tracking with Supabase
supabase
  .channel('confusion_events')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'confusion_events' }, async (payload) => {
    const courseId = payload.new.course_id;

    // Check if threshold exceeded
    const recentCount = await getRecentConfusionCount(courseId);
    const activeStudents = await getActiveStudentCount(courseId);
    const percentage = (recentCount / activeStudents) * 100;

    if (percentage > 25) {
      // Update all instructor sessions for this course
      const instructorSessions = await getInstructorSessions(courseId);

      for (const session of instructorSessions) {
        await updateWidgetState(session.chatkit_session_id, {
          spike: {
            active: true,
            message: `${recentCount} students confused in last 2 minutes — consider pausing`,
          },
          chartData: await getHeatmapData(courseId),
        });
      }
    }
  })
  .subscribe();

async function updateWidgetState(sessionId: string, stateUpdate: Partial<ClassAssistWidgetState>) {
  // Call AgentKit API to update widget state
  await fetch(`https://api.openai.com/v1/chatkit/sessions/${sessionId}/widgets/class-assist/state`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(stateUpdate),
  });
}
```

## Widget State Schema

```typescript
interface ClassAssistWidgetState {
  courseName: string;
  view: 'student' | 'instructor';
  viewOptions: Array<{ value: string; label: string }>;
  askOpen: boolean;
  metrics: {
    improvement: string; // e.g., "22%"
  };
  spike: {
    active: boolean;
    message: string;
  };
  chartData: Array<{
    label: string; // e.g., "Slide 1"
    confused: number; // percentage
  }>;
}
```

## Testing the Widget

### 1. Local Testing with ChatKit

```bash
# Start backend
cd apps/backend
npm run dev

# Start frontend
cd apps/frontend
npm run dev

# Visit http://localhost:5173 and trigger LTI launch
```

### 2. Test Student View

- Click "I'm Confused" → Should trigger `confusion.ping` action
- Click "Ask a Question" → Form should expand (`ui.toggle`)
- Submit question → Should trigger `question.submit` action
- Click study tool buttons → Should trigger respective `study.*` actions

### 3. Test Instructor View

- Switch view dropdown to "Instructor view" → Should trigger `view.set`
- Chart should display confusion heatmap data
- Spike warning should show if `spike.active = true`
- Action buttons should trigger `intervention.*` actions

## Troubleshooting

### Widget Not Appearing

1. **Verify widget upload**: Check that `class-assist.widget` is uploaded to your AgentKit workflow
2. **Check widget_state**: Ensure initial state is passed during ChatKit session creation
3. **Workflow ID mismatch**: Confirm `CHATKIT_WORKFLOW_ID` in `.env` matches the workflow where widget is uploaded
4. **Browser console**: Check for ChatKit SDK errors in developer tools

### Actions Not Working

1. **AgentKit function registration**: Verify all 9 functions are registered in workflow configuration
2. **Function endpoint URLs**: Ensure AgentKit function URLs point to correct backend endpoints
3. **Authentication**: Check `Authorization` headers in function HTTP configs
4. **Action type mismatch**: Ensure widget action types exactly match function names (e.g., `confusion.ping` → `track_confusion`)
5. **Backend logs**: Check Fastify server logs for incoming AgentKit requests

### State Not Updating

1. **Session ID**: Verify correct ChatKit session ID is used in `updateWidgetState` calls
2. **Widget state schema**: Ensure state updates match `ClassAssistWidgetState` interface
3. **Supabase real-time**: Check Supabase channel subscriptions are active
4. **AgentKit API errors**: Log responses from ChatKit widget state API calls
5. **Network issues**: Verify backend can reach `api.openai.com`

### Function Calls Failing

1. **HTTP endpoint accessibility**: Test function endpoints with curl/Postman
2. **CORS configuration**: Ensure backend allows requests from OpenAI IPs
3. **Request validation**: Check function parameter types match AgentKit definitions
4. **Supabase connection**: Verify `SUPABASE_URL` and keys are correct
5. **OpenAI API key**: Confirm `OPENAI_API_KEY` has proper permissions

## Testing Strategy

### 1. Test Widget Upload
```bash
# Download widget from studio or use local file
curl -X POST https://api.openai.com/v1/workflows/wf_xxx/widgets \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "file=@class-assist.widget"
```

### 2. Test Session Creation
```bash
# Create ChatKit session with widget state
curl -X POST http://localhost:4000/api/chatkit/session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "courseId": "test_course",
    "courseName": "Test Course",
    "role": "Learner"
  }'
```

### 3. Test Function Endpoints
```bash
# Test confusion tracking
curl -X POST http://localhost:4000/api/agentkit/track_confusion \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "course_id": "test_course",
    "slide_id": "slide_1",
    "timestamp": "2025-01-15T10:30:00Z"
  }'
```

### 4. Test Widget in Browser
1. Start backend: `cd apps/backend && npm run dev`
2. Start frontend: `cd apps/frontend && npm run dev`
3. Visit `http://localhost:5173`
4. Trigger LTI launch or use dev launch endpoint
5. Interact with widget buttons and verify network requests

## Next Steps

1. ✅ **Widget Created**: `class-assist.widget` with student/instructor views
2. ⏳ **Upload Widget**: Upload to AgentKit workflow in OpenAI Platform
3. ⏳ **Register Functions**: Add 9 function definitions to workflow
4. ⏳ **Implement Handlers**: Create backend endpoints for each function
5. ⏳ **Configure Endpoints**: Point AgentKit functions to backend URLs
6. ⏳ **Test Integration**: Verify end-to-end widget → AgentKit → backend flow
7. ⏳ **Add Real-time**: Implement Supabase subscriptions for live updates
8. ⏳ **LMS Integration**: Wire up Canvas/Moodle APIs for notifications and assignments
9. ⏳ **Production Deploy**: Deploy backend with HTTPS for AgentKit webhooks
10. ⏳ **Monitoring**: Add logging and error tracking for function calls

## Production Considerations

### Security
- Use HTTPS for all AgentKit function endpoints
- Implement request validation and rate limiting
- Store `AGENTKIT_SECRET` securely for function authentication
- Validate all user inputs in function handlers
- Use Supabase RLS policies to protect data access

### Performance
- Cache widget state in Redis for fast reads
- Implement pagination for large chart datasets (>100 slides)
- Use Supabase edge functions for real-time triggers
- Optimize database queries with indexes on `course_id`, `timestamp`
- Consider CDN for static widget assets

### Monitoring
- Log all AgentKit function calls with timing metrics
- Track widget action analytics (most used features)
- Monitor confusion threshold triggers and response times
- Set up alerts for function endpoint failures
- Use Supabase dashboard for real-time metrics

## References

- [ChatKit Widget Documentation](https://platform.openai.com/docs/guides/chatkit/widgets)
- [Widget UI Components Reference](https://widgets.chatkit.studio/components)
- [AgentKit Functions Guide](https://platform.openai.com/docs/guides/agentkit/functions)
- [AgentKit HTTP Functions](https://platform.openai.com/docs/guides/agentkit/http-functions)
- [OpenAI Platform Workflows](https://platform.openai.com/playground/assistants)
