# Quick Start: Setting Up Agent Builder

## What You're Seeing

You have an **MCP section** in the Agent Builder Tools menu. This is good! But MCP servers require deployment/hosting, which is complex for local development.

## Recommended Approach: Skip MCP for Now

Since you're just setting up, let's use the **simpler approach** first and worry about MCP later.

---

## Step-by-Step: Configure Agent WITHOUT MCP

### 1. Add System Instructions

In the **Instructions** field, paste the following:

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

### 2. Set Model

Keep **gpt-4-turbo** selected (or use gpt-4o if available)

### 3. Save the Agent

Click **Save** or **Create** to save your agent configuration.

**For now, DO NOT add any functions/tools yet.** We'll do that after implementing the backend API.

---

## Why Skip Functions for Now?

The 9 functions (track_confusion, submit_question, etc.) need backend API endpoints to work. Right now:

- ❌ Backend API handlers don't exist yet
- ❌ No way to test if functions work
- ❌ Functions will fail when called

**Better approach:**

1. ✅ Create the agent with instructions only
2. ✅ Implement backend API handlers
3. ✅ Test handlers with Postman/curl
4. ✅ Then add functions to agent with working endpoints

---

## Next Steps

### Immediate:
1. Save your agent in Agent Builder (instructions only, no tools)
2. Copy the **Workflow ID** or **Agent ID** from the URL
3. Update `.env` files with the ID

### Then:
1. Implement backend API handlers (`/api/agentkit/*`)
2. Test each endpoint manually
3. Add functions to agent once they work
4. Upload widget after functions are configured
5. Test end-to-end integration

---

## Testing Without Functions

You can test the agent right now in the Agent Builder playground:

**Try asking:**
- "I'm confused about binary search trees"
- "Can you explain recursion?"
- "Show me my confusion history"

The agent will respond based on its instructions, but won't be able to call any backend functions yet (since we haven't added them).

---

## When to Add MCP/Functions

Add functions when:
- ✅ Backend API is running and tested
- ✅ All 9 endpoints (`/api/agentkit/*`) work
- ✅ You've verified with Postman/curl
- ✅ You're ready to integrate with LTI

---

## Summary

**Right now:**
- Configure agent with instructions only
- Skip tools/functions
- Get agent ID
- Start building backend

**Later:**
- Add functions when backend is ready
- Test each function individually
- Upload widget after functions work
