# AgentKit Function Definitions

Copy and paste each function definition into the OpenAI Agent Builder when you click "Function" in the Tools dropdown.

---

## Function 1: track_confusion

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/track_confusion`
- Method: `POST`
- Headers:
  ```json
  {
    "Authorization": "Bearer YOUR_BACKEND_SECRET_TOKEN",
    "Content-Type": "application/json"
  }
  ```

---

## Function 2: submit_question

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/submit_question`
- Method: `POST`
- Headers: Same as above

---

## Function 3: generate_quiz

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/generate_quiz`
- Method: `POST`
- Headers: Same as above

---

## Function 4: explain_topic

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/explain_topic`
- Method: `POST`
- Headers: Same as above

---

## Function 5: fetch_notes

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/fetch_notes`
- Method: `POST`
- Headers: Same as above

---

## Function 6: get_confusion_heatmap

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/get_confusion_heatmap`
- Method: `POST`
- Headers: Same as above

---

## Function 7: export_confusion_data

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/export_confusion_data`
- Method: `POST`
- Headers: Same as above

---

## Function 8: notify_students_via_lms

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/notify_students_via_lms`
- Method: `POST`
- Headers: Same as above

---

## Function 9: assign_remedial_quiz

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

**HTTP Configuration:**
- Implementation Type: `HTTP`
- URL: `https://your-backend-url.com/api/agentkit/assign_remedial_quiz`
- Method: `POST`
- Headers: Same as above

---

## Instructions

1. Click "Function" in the Tools dropdown for each function
2. Copy the JSON definition from this file
3. Paste it into the function definition dialog
4. Configure the HTTP endpoint settings
5. Repeat for all 9 functions

After adding all functions, you'll need to add the system instructions to the Agent's Instructions field (see `agentkit-workflow-setup.md` for the full system prompt).
