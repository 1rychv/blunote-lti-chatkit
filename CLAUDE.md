# CLAUDE.md

This file provides guidance to Claude Code when working with the BluNote LTI 2.0 plugin.

## Project Overview

BluNote LTI 2.0 is an LTI 1.3 compliant tool that embeds a ChatKit-driven conversational interface within LMS platforms (Canvas, Moodle, Blackboard, D2L). All AI reasoning, workflows, and LMS integrations are orchestrated through AgentKit agents.

## Tech Stack

- **Frontend**: React + TypeScript (Vite) with ChatKit SDK
- **Backend**: Node.js/TypeScript (Fastify) + AgentKit runtime
- **Database**: Supabase (Postgres + real-time subscriptions)
- **LTI**: IMS LTI 1.3 (OIDC, JWT, AGS, NRPS, Deep Linking)
- **AI Orchestration**: AgentKit agents with custom tools/functions
- **Real-time**: WebSocket for ChatKit streaming

## Repository Structure

```
/
├── apps/
│   ├── backend/          # Fastify server, LTI handlers, AgentKit runtime
│   ├── frontend/         # ChatKit React app
├── packages/
│   ├── shared/           # Shared TypeScript types and utilities
├── .claude/              # Custom agents and slash commands
│   ├── agents/
│   │   ├── context-doc-finder/
│   │   ├── test-automator/
│   │   ├── ios-developer/
│   │   └── ui-ux-designer/
```

## Development Workflow

### Using Custom Agents

This project has specialized agents configured. **Always use these agents** when appropriate:

- **context-doc-finder**: Use when searching for ChatKit, AgentKit, or LTI documentation before implementing features
- **test-automator**: Use after writing new code modules to create comprehensive test coverage
- **ui-ux-designer**: Use when designing ChatKit interface components or optimizing user flows
- **ios-developer**: (Not applicable for this web project)

**Example**: Before implementing ChatKit message streaming, invoke the context-doc-finder agent to locate ChatKit SDK documentation for real-time messaging patterns.

### Playwright MCP for Frontend Changes

**CRITICAL**: Whenever making changes to the frontend ChatKit interface:

1. Use Microsoft Playwright MCP tools to test UI changes in real-time
2. After any component modification, use `mcp__playwright__browser_snapshot` to verify rendering
3. Test interactive flows with `mcp__playwright__browser_click`, `mcp__playwright__browser_type`, etc.
4. Validate accessibility with snapshot tools before marking tasks complete

**Example workflow**:
```
1. Edit ChatKit component
2. Navigate to local dev server with mcp__playwright__browser_navigate
3. Take snapshot with mcp__playwright__browser_snapshot
4. Verify interactive elements with mcp__playwright__browser_click
5. Check console for errors with mcp__playwright__browser_console_messages
```

## ChatKit Integration (LMS Class Assist Blueprint)

The ChatKit SDK is the primary UI layer, following the blueprint in `LMS Class Assist.txt`:

### Core ChatKit Components
- **ChatApp**: Main container mounting all ChatKit primitives
- **MessageList**: Displays conversation history with streaming support
- **Composer**: User input field with action triggers
- **Sidebar/Panel**: Course context, insights, instructor analytics
- **ActionBar**: Study plan, reflective journal, tutoring buttons

### ChatKit ↔ AgentKit Wiring
- Frontend sends user messages via WebSocket to backend
- Backend routes messages to AgentKit `blunote_companion` agent
- AgentKit executes reasoning chain, invokes tools (LMS APIs, retrieval, journal save)
- Results stream back through backend WebSocket to ChatKit for rendering
- All AI logic lives in AgentKit; ChatKit is purely presentational

### Launch Context Personalization
- LTI launch payload injected into ChatKit context on session bootstrap
- User role (Learner vs Instructor) determines available actions and UI panels
- Course metadata pre-populates sidebar with syllabus, assignments, announcements

## Key Development Commands

### Backend (Fastify + AgentKit)
```bash
cd apps/backend
npm install
npm run dev          # Development with hot reload
npm run build        # TypeScript compilation
npm start            # Production server
npm test             # Run test suite
```

### Frontend (ChatKit React)
```bash
cd apps/frontend
npm install
npm run dev          # Vite dev server on :5173
npm run build        # Production bundle
npm run preview      # Preview production build
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

### Database (Supabase)
```bash
# Run migrations (from apps/backend)
npm run db:migrate

# Reset database (dev only)
npm run db:reset
```

## Environment Configuration

### Backend `.env`
```
# Server
PORT=4000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# LTI 1.3 (per platform)
PLATFORM_ISSUER=https://canvas.instructure.com
PLATFORM_CLIENT_ID=xxx
PLATFORM_JWKS_URL=https://canvas.instructure.com/api/lti/security/jwks
PLATFORM_AUTH_LOGIN_URL=https://canvas.instructure.com/api/lti/authorize_redirect

# AgentKit
AGENTKIT_API_KEY=xxx
AGENTKIT_WORKSPACE_ID=xxx

# ChatKit
CHATKIT_API_KEY=xxx
```

### Frontend `.env`
```
VITE_BACKEND_URL=http://localhost:4000
VITE_CHATKIT_APP_ID=xxx
```

## LTI 1.3 Flow

1. **OIDC Login**: `/lti/oidc/login` validates state, redirects to LMS
2. **Launch**: `/lti/launch` validates JWT, creates session, provisions AgentKit agent
3. **Bootstrap**: Frontend fetches `/session/bootstrap` with ChatKit config + context
4. **WebSocket**: `/session/live` streams AgentKit messages to ChatKit
5. **Deep Linking** (optional): `/lti/deeplink` for instructor content selection
6. **AGS**: `/lti/grade` submits scores when AgentKit workflows produce graded artifacts

## AgentKit Architecture

### Primary Agent: `blunote_companion`
Orchestrates all conversation, delegates to tools, maintains session memory keyed by `context_id` + `user_id`.

### Registered Tools/Functions
- `fetch_course_assets(course_id, filters)`: Retrieve LMS files, modules, assignments
- `summarize_material(content_refs, audience)`: Generate study summaries
- `log_reflection(user_id, course_id, payload)`: Save reflective journal entries
- `generate_study_plan(user_id, course_id, duration, focus_topics)`: Create personalized plans
- `submit_grade(lms_context, score, payload)`: AGS grade passback
- `create_todo_items(user_id, course_id, tasks)`: Task list generation

### Knowledge Sources
- Supabase (cached course content, prior reflections)
- LMS REST APIs (Canvas, Moodle, etc.)
- Uploaded documents ingested to vector store (Pinecone/pgvector)

## Testing Strategy

### Unit Tests (Jest/Vitest)
- LTI JWT validation logic
- AgentKit function handlers
- ChatKit message transformation utilities

### Integration Tests
- End-to-end LTI launch flow with mock issuer
- AgentKit tool execution with mocked LMS APIs
- WebSocket message relay backend → ChatKit

### E2E Tests (Playwright)
- Full user flows: launch → chat → study plan → journal save
- Instructor dashboard analytics rendering
- Role-based UI variations (Learner vs Instructor)

### Accessibility Tests
- WCAG 2.1 AA compliance for ChatKit components
- Keyboard navigation, screen reader labels, color contrast

## Security & Compliance

- **JWT Validation**: Strict `aud`, `iss`, `exp`, `nonce` checks on LTI launches
- **Session Tokens**: HTTP-only cookies + rotating backend tokens
- **HTTPS Enforcement**: HSTS headers on hosted domain
- **CSP**: Content Security Policy locked to ChatKit + AgentKit hosts
- **Webhook HMAC**: Validate all inbound AgentKit events with signatures
- **GDPR/FERPA**: User data deletion API, minimal PII storage, audit logging

## Current Phase: Foundations (Week 1)

Following `blunote-lti-planning.md` milestones:

- [ ] Monorepo scaffold (apps/backend, apps/frontend, packages/shared)
- [ ] Backend server setup (Fastify, LTI handlers, AgentKit runtime)
- [ ] Frontend ChatKit shell (React + Vite)
- [ ] Environment templates (`.env.example`)
- [ ] Development tooling (ESLint, Prettier, TypeScript)
- [ ] Supabase schema initialization
- [ ] LTI launch validator skeleton
- [ ] ChatKit ↔ AgentKit wiring blueprint

## Common Pitfalls

1. **Do NOT bypass custom agents**: Always use `context-doc-finder` before implementing ChatKit/AgentKit features
2. **Do NOT skip Playwright verification**: Every frontend change must be visually tested with MCP tools
3. **Do NOT hardcode LTI credentials**: Use platform-specific environment variables
4. **Do NOT expose service role keys**: Supabase service key only in backend, never in frontend
5. **Do NOT skip accessibility**: ChatKit must meet WCAG 2.1 AA for LMS iframe embedding

## Next Steps

1. Complete Phase 0 scaffolding (this initialization)
2. Implement LTI 1.3 OIDC + launch flow (Phase 1)
3. Build ChatKit UI shell with mock AgentKit (Phase 2)
4. Wire real AgentKit tools and Supabase integration (Phase 3)
5. Add Canvas/Moodle LMS API adapters (Phase 4)
6. QA, security review, pilot deployment (Phases 5-6)

---

**Document Status**: Living specification — update as implementation progresses and pilot feedback arrives.
