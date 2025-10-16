# AgentKit Workflow Setup Guide

## Overview

This guide will help you create the AgentKit workflow for the BluNote LTI confusion tracking system using OpenAI's Agent Builder.

## Step 1: Create the Workflow in OpenAI Platform

### Access Agent Builder
1. Go to https://platform.openai.com/playground/assistants
2. Click **"Create"** or **"New Assistant"**
3. Select **"Agent Builder"** mode

### Basic Configuration

**Name:** `BluNote Companion`

**Instructions (System Prompt):**
```
You are the BluNote Companion, an AI assistant embedded in Learning Management Systems (LMS) to help students and instructors with real-time confusion tracking and personalized learning support.

Your primary responsibilities:

FOR STUDENTS:
- Track confusion signals and provide personalized support
- Answer questions about course material (anonymously by default)
- Generate personalized quizzes based on confusion zones
- Provide re-explanations of difficult topics
- Retrieve and summarize course notes

FOR INSTRUCTORS:
- Provide real-time confusion heatmaps by slide/topic
- Alert when confusion threshold is exceeded (>25% of active students)
- Export confusion data for analysis
- Send targeted notifications to struggling students via LMS
- Assign remedial quizzes to confused students

BEHAVIOR GUIDELINES:
- Always maintain student anonymity by default (FERPA/GDPR compliant)
- Be encouraging and supportive, never judgmental
- Provide concise, actionable responses
- Use the provided functions to interact with the LMS and database
- When confusion spikes, suggest concrete interventions

CONTEXT:
- You have access to course content, slides, assignments, and student progress
- You can track which topics cause the most confusion
- You can see real-time classroom engagement metrics
- You operate within the LTI 1.3 framework for secure LMS integration
```

**Model:** `gpt-4-turbo-preview` or `gpt-4o`

**Temperature:** `0.7` (balanced between creative and focused)

## Step 2: Add Function Definitions

Click **"Add function"** or **"Tools"** and add these 9 functions:

### Function 1: track_confusion

```json
{
  "name": "track_confusion",
  "description": "Record a confusion event when a student clicks the 'I'm Confused' button. Tracks user, course, slide, and timestamp. Returns whether confusion threshold was exceeded.",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The student's unique identifier from the LMS"
      },
      "course_id": {
        "type": "string",
        "description": "The course identifier"
      },
      "slide_id": {
        "type": "string",
        "description": "The current slide/content identifier (optional)"
      },
      "topic": {
        "type": "string",
        "description": "The topic or section name (optional)"
      },
      "timestamp": {
        "type": "string",
        "description": "ISO8601 timestamp of the confusion event"
      }
    },
    "required": ["user_id", "course_id", "timestamp"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/track_confusion`
**Method:** `POST`

---

### Function 2: submit_question

```json
{
  "name": "submit_question",
  "description": "Save a student's question to the database. Questions can be anonymous or attributed. Returns confirmation and question ID.",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The student's user ID (null if anonymous)"
      },
      "course_id": {
        "type": "string",
        "description": "The course identifier"
      },
      "question_body": {
        "type": "string",
        "description": "The full text of the student's question"
      },
      "anonymous": {
        "type": "boolean",
        "description": "Whether the question should be anonymous (default: true)"
      },
      "slide_id": {
        "type": "string",
        "description": "The slide/content the question relates to (optional)"
      },
      "topic": {
        "type": "string",
        "description": "The topic the question relates to (optional)"
      }
    },
    "required": ["course_id", "question_body"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/submit_question`
**Method:** `POST`

---

### Function 3: generate_quiz

```json
{
  "name": "generate_quiz",
  "description": "Generate a personalized quiz for a student based on their confusion zones and learning needs. Returns quiz content with questions and answers.",
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
        "enum": ["confusion-zones", "recent-topics", "comprehensive", "specific-topic"],
        "description": "What the quiz should focus on"
      },
      "difficulty": {
        "type": "string",
        "enum": ["easy", "medium", "hard", "adaptive"],
        "description": "Quiz difficulty level (default: adaptive)"
      },
      "num_questions": {
        "type": "integer",
        "description": "Number of questions to generate (default: 5)"
      },
      "topics": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Specific topics to include (optional)"
      }
    },
    "required": ["user_id", "course_id", "focus"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/generate_quiz`
**Method:** `POST`

---

### Function 4: explain_topic

```json
{
  "name": "explain_topic",
  "description": "Generate a re-explanation of a topic that a student is confused about. Uses different teaching approaches and examples than the original material.",
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
        "description": "The specific topic to explain"
      },
      "explanation_style": {
        "type": "string",
        "enum": ["simple", "detailed", "example-based", "visual", "analogy"],
        "description": "How to approach the explanation (default: simple)"
      },
      "prior_confusion": {
        "type": "boolean",
        "description": "Whether student has been confused about this topic before"
      }
    },
    "required": ["user_id", "course_id", "topic"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/explain_topic`
**Method:** `POST`

---

### Function 5: fetch_notes

```json
{
  "name": "fetch_notes",
  "description": "Retrieve course notes for a specific slide, topic, or section. Returns formatted notes with metadata.",
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
        "description": "The slide identifier (optional)"
      },
      "topic": {
        "type": "string",
        "description": "The topic to retrieve notes for (optional)"
      },
      "section": {
        "type": "string",
        "description": "The course section (optional)"
      },
      "include_personal_notes": {
        "type": "boolean",
        "description": "Whether to include student's personal notes (default: true)"
      }
    },
    "required": ["user_id", "course_id"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/fetch_notes`
**Method:** `POST`

---

### Function 6: get_confusion_heatmap

```json
{
  "name": "get_confusion_heatmap",
  "description": "Fetch confusion metrics aggregated by slide/topic for the instructor dashboard. Returns confusion percentages, timestamps, and trends.",
  "parameters": {
    "type": "object",
    "properties": {
      "course_id": {
        "type": "string",
        "description": "The course identifier"
      },
      "time_range": {
        "type": "string",
        "enum": ["last_hour", "today", "this_week", "this_month", "all_time"],
        "description": "Time range for confusion data (default: today)"
      },
      "group_by": {
        "type": "string",
        "enum": ["slide", "topic", "section", "lecture"],
        "description": "How to group the data (default: slide)"
      },
      "include_trends": {
        "type": "boolean",
        "description": "Whether to include trend analysis (default: true)"
      }
    },
    "required": ["course_id"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/get_confusion_heatmap`
**Method:** `POST`

---

### Function 7: export_confusion_data

```json
{
  "name": "export_confusion_data",
  "description": "Export confusion tracking data as CSV or JSON for instructor analysis. Includes timestamps, students (anonymized), slides, and topics.",
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
        "description": "Export format (default: csv)"
      },
      "time_range": {
        "type": "string",
        "description": "Time range for export (e.g., 'last_week', 'this_month')"
      },
      "include_anonymous": {
        "type": "boolean",
        "description": "Whether to include anonymized student data (default: true)"
      },
      "include_metadata": {
        "type": "boolean",
        "description": "Whether to include slide/topic metadata (default: true)"
      }
    },
    "required": ["course_id", "format"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/export_confusion_data`
**Method:** `POST`

---

### Function 8: notify_students_via_lms

```json
{
  "name": "notify_students_via_lms",
  "description": "Send notifications to students through the LMS messaging system. Can target confused students, all students, or struggling students.",
  "parameters": {
    "type": "object",
    "properties": {
      "course_id": {
        "type": "string",
        "description": "The course identifier"
      },
      "recipient_filter": {
        "type": "string",
        "enum": ["confused_students", "all_students", "struggling_students", "specific_users"],
        "description": "Which students to notify"
      },
      "user_ids": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Specific user IDs to notify (if recipient_filter is 'specific_users')"
      },
      "subject": {
        "type": "string",
        "description": "Notification subject line"
      },
      "message": {
        "type": "string",
        "description": "The notification message content"
      },
      "include_resources": {
        "type": "boolean",
        "description": "Whether to include helpful resource links (default: true)"
      }
    },
    "required": ["course_id", "recipient_filter", "subject", "message"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/notify_students_via_lms`
**Method:** `POST`

---

### Function 9: assign_remedial_quiz

```json
{
  "name": "assign_remedial_quiz",
  "description": "Create and assign remedial quizzes to students who are confused. Automatically grades quizzes and tracks completion.",
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
      "target_students": {
        "type": "string",
        "enum": ["confused_students", "all_students", "specific_users"],
        "description": "Who to assign the quiz to"
      },
      "user_ids": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Specific user IDs (if target_students is 'specific_users')"
      },
      "topics": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Topics to cover in the quiz"
      },
      "due_date": {
        "type": "string",
        "description": "ISO8601 due date for the quiz (optional)"
      },
      "passing_score": {
        "type": "integer",
        "description": "Minimum score to pass (default: 70)"
      }
    },
    "required": ["course_id", "quiz_type", "target_students", "topics"]
  }
}
```

**Implementation Type:** `HTTP`
**URL:** `https://your-backend-url.com/api/agentkit/assign_remedial_quiz`
**Method:** `POST`

---

## Step 3: Configure HTTP Endpoints

For each function, configure the HTTP settings:

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_BACKEND_SECRET_TOKEN",
  "Content-Type": "application/json"
}
```

**Timeout:** `30 seconds`

**Retry Policy:** `3 attempts with exponential backoff`

## Step 4: Add Widget to Workflow

After creating the workflow:

1. Copy your Workflow ID (starts with `wf_...`)
2. In the workflow settings, look for **"Widgets"** or **"Custom UI"** tab
3. Click **"Add Widget"** or **"Upload Widget"**
4. Upload: `apps/frontend/src/widgets/class-assist.widget`

If there's no widget upload option yet:
- Save the workflow first
- Check if widgets are in beta/preview features
- Enable any required feature flags
- Contact OpenAI support to enable widgets for your workspace

## Step 5: Test the Workflow

Once created, test with these prompts:

**Student Scenarios:**
- "I'm confused about binary search trees"
- "Can you quiz me on sorting algorithms?"
- "Explain recursion in simple terms"

**Instructor Scenarios:**
- "Show me the confusion heatmap for today"
- "Which topics are students struggling with most?"
- "Export confusion data for the last week"

## Step 6: Get Workflow ID

After saving:
1. Copy the Workflow ID from the URL or settings
2. Update your `.env` files:
   ```
   # apps/backend/.env
   CHATKIT_WORKFLOW_ID=wf_your_actual_workflow_id_here

   # apps/frontend/.env
   VITE_CHATKIT_WORKFLOW_ID=wf_your_actual_workflow_id_here
   ```

## Troubleshooting

### Can't Find Widget Upload
- Widgets may be in private beta
- Check OpenAI Platform dashboard for feature availability
- Email support@openai.com to request widget access

### Functions Not Working
- Verify HTTP endpoint URLs are accessible from OpenAI's servers
- Check Authorization headers are correct
- Test endpoints with curl before connecting to AgentKit

### Widget Not Rendering
- Ensure widget JSON is valid
- Check widget state schema matches your data
- Verify workflow ID is correct in backend

## Next Steps

After workflow creation:
1. Update environment variables with Workflow ID
2. Implement backend function handlers
3. Test ChatKit session creation
4. Deploy backend with HTTPS for production
