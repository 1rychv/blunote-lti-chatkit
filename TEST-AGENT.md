# Testing the BluNote Agent

## ✅ What's Done

1. ✅ **Database tables created** (via Supabase MCP)
   - confusion_events
   - student_questions
   - course_notes
   - course_enrollments

2. ✅ **API endpoint created** (`/api/chat`)
   - Accepts message, user_id, course_id, role
   - Calls OpenAI Agents SDK
   - Returns agent response

3. ✅ **Server configured** (routes registered in `server.ts`)

---

## How to Test

### 1. Start the Backend

```bash
cd apps/backend
npm run dev
```

You should see:
```
🚀 BluNote LTI backend listening on http://0.0.0.0:4000
```

### 2. Test Health Endpoint

```bash
curl http://localhost:4000/api/chat/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-16T...",
  "agent": "BluNote Companion",
  "functions": 9
}
```

### 3. Test Simple Message

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, can you help me?",
    "user_id": "student123",
    "course_id": "cs101",
    "role": "student"
  }'
```

Expected response:
```json
{
  "success": true,
  "response": "Hello! I'm the BluNote Companion...",
  "tool_calls": []
}
```

### 4. Test Confusion Tracking

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am confused about binary search trees",
    "user_id": "student123",
    "course_id": "cs101",
    "role": "student"
  }'
```

The agent should automatically call `trackConfusion()` and store it in Supabase!

### 5. Test Question Submission

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you save this question: How does recursion work?",
    "user_id": "student123",
    "course_id": "cs101",
    "role": "student"
  }'
```

The agent should call `submitQuestion()`.

### 6. Test Instructor View (Heatmap)

```bash
curl -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me the confusion heatmap for today",
    "user_id": "instructor456",
    "course_id": "cs101",
    "role": "instructor"
  }'
```

The agent should call `getConfusionHeatmap()`.

---

## Verify Data in Supabase

After testing, check the database:

```bash
# Using Supabase CLI or dashboard
SELECT * FROM confusion_events ORDER BY created_at DESC LIMIT 5;
SELECT * FROM student_questions ORDER BY created_at DESC LIMIT 5;
```

---

## Troubleshooting

### Error: "Cannot find module"

Make sure you ran:
```bash
cd apps/backend
npm install
```

### Error: "Missing Supabase environment variables"

Check your `.env` file has:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=sk-proj-your_key_here
```

### Error: "Agent result is undefined"

Check:
1. OPENAI_API_KEY is valid
2. Workflow ID matches: `wf_68f098cbd02881909ef6081a835dd67d0e9da771c613a7e7`
3. OpenAI API has credits

### No tool calls happening

This is normal! The agent only calls tools when necessary. Try more specific prompts like:
- "Track that I'm confused"
- "Save my question"
- "Show confusion data"

---

## Expected Behavior

### Agent WITHOUT Function Calls

**You ask:** "Hello"
**Agent responds:** "Hello! I'm the BluNote Companion..."
**Tool calls:** []

### Agent WITH Function Calls

**You ask:** "I'm confused about recursion"
**Agent responds:** "I've tracked your confusion. Let me help..."
**Tool calls:** [{ function: "trackConfusion", args: {...} }]

**Then check database:**
```sql
SELECT * FROM confusion_events WHERE user_id = 'student123';
```
You should see a new row!

---

## Next Steps

Once this works:

1. ✅ Backend API is working
2. Connect frontend ChatKit
3. Test full flow with UI
4. Add LTI launch integration

---

## Quick Test Script

Save this as `test-agent.sh`:

```bash
#!/bin/bash

echo "Testing BluNote Agent..."
echo ""

echo "1. Health check:"
curl -s http://localhost:4000/api/chat/health | jq '.'
echo ""

echo "2. Simple message:"
curl -s -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello",
    "user_id": "test123",
    "course_id": "cs101"
  }' | jq '.'
echo ""

echo "3. Track confusion:"
curl -s -X POST http://localhost:4000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I'\''m confused about binary search",
    "user_id": "test123",
    "course_id": "cs101",
    "role": "student"
  }' | jq '.'
echo ""

echo "Done!"
```

Make executable:
```bash
chmod +x test-agent.sh
./test-agent.sh
```

---

## Success Criteria

✅ Health endpoint returns 200
✅ Agent responds to simple messages
✅ Agent calls trackConfusion when appropriate
✅ Data appears in Supabase tables
✅ No errors in server logs

**Once all these work, you're ready to connect the frontend!**
