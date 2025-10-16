# BluNote LTI 2.0 - Quick Start Guide

Get the BluNote LTI plugin running locally in 5 minutes.

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- A text editor (VS Code recommended)

---

## Step 1: Install Dependencies

From the project root:

```bash
npm install
```

This installs dependencies for all workspaces (backend, frontend, shared).

---

## Step 2: Configure Environment Variables

### Backend Configuration

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env` and set at minimum:

```env
PORT=4000
ALLOWED_ORIGIN=http://localhost:5173

# For now, you can leave Supabase/AgentKit/ChatKit empty
# The app will run in mock mode
```

### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

Edit `apps/frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000
```

---

## Step 3: Run Development Servers

From the project root:

```bash
npm run dev
```

This starts:
- Backend on `http://localhost:4000`
- Frontend on `http://localhost:5173`

**OR** run them separately:

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

---

## Step 4: Test the Application

### Option A: Test ChatKit Interface (No LTI)

1. Open `http://localhost:5173` in your browser
2. You should see the ChatKit interface with:
   - A sidebar with course context and quick actions
   - A chat window with a welcome message
   - An input field to send messages

3. Try sending a message:
   - Type "Hello" and press Enter
   - You'll get a mock response (AgentKit integration pending)

### Option B: Test Backend Health Check

```bash
curl http://localhost:4000/health
```

You should get:
```json
{"status":"ok","timestamp":"2025-10-16T..."}
```

### Option C: Test LTI Endpoints

```bash
# OIDC login (will show an error without proper LTI params, which is expected)
curl "http://localhost:4000/lti/oidc/login?iss=test&login_hint=user1&target_link_uri=http://localhost:4000/lti/launch&client_id=test"

# Config endpoint
curl http://localhost:4000/lti/config
```

---

## Step 5: Explore the Code

Key files to check out:

1. **Frontend ChatKit UI**: `apps/frontend/src/App.tsx`
2. **Backend Server**: `apps/backend/src/server.ts`
3. **LTI Launch Handler**: `apps/backend/src/lti/launch.ts`
4. **AgentKit Tools**: `apps/backend/src/agentkit/tools.ts`
5. **Shared Types**: `packages/shared/src/types/`

---

## Troubleshooting

### Port Already in Use

If port 4000 or 5173 is already in use:

**Backend**:
Edit `apps/backend/.env`:
```env
PORT=4001  # or any available port
```

**Frontend**:
Edit `apps/frontend/vite.config.ts`:
```ts
server: {
  port: 5174,  // or any available port
}
```

### TypeScript Errors

Run type checking:
```bash
npm run typecheck
```

If you see errors about missing `@types/node`, install them:
```bash
cd apps/backend
npm install --save-dev @types/node
```

### WebSocket Connection Fails

Make sure both backend and frontend are running. Check browser console for errors.

---

## Next Steps After Quickstart

1. **Set up Supabase** (see `blunote-lti-planning.md` Section 7.1):
   - Create a Supabase project
   - Run migrations (to be created)
   - Update `.env` with Supabase credentials

2. **Configure LTI with Canvas/Moodle**:
   - Use a Canvas sandbox or Moodle test instance
   - Register the tool using `/lti/config` endpoint
   - Test full LTI launch flow

3. **Wire AgentKit**:
   - Sign up for AgentKit (or equivalent)
   - Update `AGENTKIT_API_KEY` in `.env`
   - Replace mock responses in `apps/backend/src/agentkit/agent.ts`

4. **Enhance ChatKit UI**:
   - Implement study plan rendering
   - Add reflective journal form
   - Improve styling and UX

---

## Development Workflow

### Making Changes

1. **Backend**: Changes trigger auto-reload via `tsx watch`
2. **Frontend**: Changes trigger HMR (Hot Module Replacement) via Vite
3. **Shared Types**: Changes require rebuilding:
   ```bash
   cd packages/shared
   npm run build
   ```

### Using Playwright MCP (per CLAUDE.md)

After making frontend changes:

```
# In Claude Code chat:
"Please test the ChatKit interface using Playwright MCP"
```

Claude will use Playwright browser tools to:
- Navigate to `http://localhost:5173`
- Take snapshots of the UI
- Test interactive elements
- Verify console for errors

### Running Tests (When Implemented)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend |
| `npm run build` | Build all workspaces for production |
| `npm test` | Run all tests |
| `npm run lint` | Lint all code |
| `npm run format` | Format all code with Prettier |
| `npm run typecheck` | Type-check all TypeScript |

---

## Getting Help

- **Documentation**: Check `INITIALIZATION.md` and `blunote-lti-planning.md`
- **Claude Code**: Use custom agents (see `CLAUDE.md`):
  - `context-doc-finder`: Search ChatKit/AgentKit docs
  - `ui-ux-designer`: Design help for ChatKit components
  - `test-automator`: Generate tests
- **Issues**: Create a GitHub issue if you find bugs

---

**You're all set!** The project is initialized and ready for Phase 1 implementation.
