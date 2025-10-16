# BluNote LTI 2.0

**ChatKit + AgentKit powered learning assistant for LMS platforms**

---

## Overview

BluNote LTI 2.0 is an IMS LTI 1.3 compliant tool that embeds a conversational AI assistant directly into Canvas, Moodle, Blackboard, and D2L. The interface is built with ChatKit SDK, and all AI orchestration runs through AgentKit agents.

### Key Features

- **ChatKit Conversational UI**: Low-friction chat interface for study assistance, reflective journaling, and insights
- **AgentKit Orchestration**: All AI reasoning, LMS integrations, and workflows centralized in AgentKit agents
- **LTI 1.3 Compliance**: OIDC login, JWT validation, deep linking, Names & Roles (NRPS), Assignment & Grade Services (AGS)
- **Role-Aware**: Context-aware responses for learners and instructors
- **Real-time**: WebSocket streaming for AgentKit → ChatKit message delivery

---

## Architecture

```
┌─────────────── LMS (Canvas/Moodle/etc.) ───────────────┐
│           LTI 1.3 Launch / Deep Linking                 │
└────────────────────┬────────────────────────────────────┘
                     │
          OIDC + LTI Launch POST
                     │
┌────────────────────▼────────────────────────────────────┐
│    BluNote LTI Service (Backend, AgentKit host)         │
│  • /oidc/login          • /lti/launch                   │
│  • Session bootstrap    • AgentKit runtime              │
│  • AGS & NRPS adapters  • WebSocket for ChatKit         │
└───────┬─────────────────────────────┬───────────────────┘
        │                             │
   ChatKit channel          AgentKit actions/events
        │                             │
┌───────▼─────────────┐   ┌───────────▼──────────────────┐
│ ChatKit Frontend    │   │   AgentKit Agent(s)          │
│ • Chat interface    │   │   • Retrieval + synthesis    │
│ • Panels & sidebars │   │   • Workflow automations     │
│ • Action triggers   │   │   • LMS API connectors       │
└─────────────────────┘   └──────────────────────────────┘
```

---

## Tech Stack

- **Frontend**: React + TypeScript (Vite), ChatKit SDK
- **Backend**: Node.js/TypeScript (Fastify), AgentKit runtime
- **Database**: Supabase (Postgres + real-time subscriptions)
- **LTI**: IMS LTI 1.3 (OIDC, JWT, AGS, NRPS, Deep Linking)
- **AI Orchestration**: AgentKit agents with custom tools

---

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- Supabase account (free tier works)
- LMS platform with LTI 1.3 support (Canvas, Moodle, etc.)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repo-url>
   cd "ChatKit BluNote LTI"
   npm install
   ```

2. **Configure environment**:
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your credentials

   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env
   # Edit apps/frontend/.env with your credentials
   ```

3. **Run development servers**:
   ```bash
   # Start both backend + frontend
   npm run dev

   # Or run separately
   npm run dev:backend   # Port 4000
   npm run dev:frontend  # Port 5173
   ```

4. **Configure LTI in your LMS**:
   - Register tool with LMS using `/lti/config` endpoint
   - Add client ID, deployment ID, and JWKS URL
   - See `docs/lti-setup.md` for platform-specific guides

---

## Project Structure

```
/
├── apps/
│   ├── backend/              # Fastify server, LTI, AgentKit
│   │   ├── src/
│   │   │   ├── server.ts     # Entry point
│   │   │   ├── lti/          # OIDC, launch, AGS, NRPS
│   │   │   ├── chatkit/      # Session bootstrap, WebSocket
│   │   │   ├── agentkit/     # Agent definitions, tools
│   │   │   └── data/         # Supabase client, repositories
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── frontend/             # ChatKit React app
│       ├── src/
│       │   ├── App.tsx       # ChatKit mount point
│       │   ├── components/   # Custom UI components
│       │   └── lib/          # Utilities, API client
│       ├── .env.example
│       └── package.json
│
├── packages/
│   └── shared/               # Shared TypeScript types
│       ├── src/
│       │   ├── types/        # LTI, AgentKit, ChatKit types
│       │   └── utils/        # Common utilities
│       └── package.json
│
├── .claude/                  # Custom agents, slash commands
├── CLAUDE.md                 # Claude Code instructions
├── blunote-lti-planning.md   # Technical plan
└── package.json              # Root workspace config
```

---

## Development

### Backend Commands

```bash
cd apps/backend

npm run dev          # Start with hot reload
npm run build        # Compile TypeScript
npm start            # Production server
npm test             # Run tests
npm run db:migrate   # Run Supabase migrations
```

### Frontend Commands

```bash
cd apps/frontend

npm run dev          # Vite dev server
npm run build        # Production bundle
npm run preview      # Preview production build
npm test             # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

---

## ChatKit Integration

The ChatKit SDK provides the entire conversational UI. Key components:

- **ChatApp**: Main container
- **MessageList**: Conversation history with streaming
- **Composer**: User input field
- **Sidebar/Panel**: Course context, insights, analytics
- **ActionBar**: Study plan, journal, tutoring triggers

All ChatKit actions route through AgentKit agents for AI processing.

---

## AgentKit Agents

### Primary Agent: `blunote_companion`

Orchestrates all conversation, delegates tasks, maintains session memory.

### Registered Tools

- `fetch_course_assets(course_id, filters)`: Retrieve LMS content
- `summarize_material(content_refs, audience)`: Generate summaries
- `log_reflection(user_id, course_id, payload)`: Save journal entries
- `generate_study_plan(user_id, course_id, duration, focus_topics)`: Create plans
- `submit_grade(lms_context, score, payload)`: AGS grade passback
- `create_todo_items(user_id, course_id, tasks)`: Task list generation

---

## LTI 1.3 Flow

1. **OIDC Login**: `/lti/oidc/login` validates state, redirects to LMS
2. **Launch**: `/lti/launch` validates JWT, creates session, provisions AgentKit agent
3. **Bootstrap**: Frontend fetches `/session/bootstrap` with ChatKit config
4. **WebSocket**: `/session/live` streams AgentKit messages to ChatKit
5. **Deep Linking** (optional): `/lti/deeplink` for content selection
6. **AGS**: `/lti/grade` submits scores when workflows produce graded artifacts

---

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

### LTI Launch Simulation
```bash
npm run dev:lti-mock
```

---

## Deployment

See `docs/deployment.md` for production setup with Docker/Kubernetes.

---

## Security

- **JWT Validation**: Strict `aud`, `iss`, `exp`, `nonce` checks
- **Session Tokens**: HTTP-only cookies + rotating backend tokens
- **HTTPS Enforcement**: HSTS headers
- **CSP**: Locked to ChatKit + AgentKit hosts
- **Webhook HMAC**: Validate AgentKit events
- **GDPR/FERPA**: User data deletion API, minimal PII storage

---

## License

MIT - see `LICENSE` file

---

## Support

- Documentation: `docs/`
- Issues: GitHub Issues
- Email: support@blunote.com

---

**Current Phase**: Foundations (Week 1) - see `blunote-lti-planning.md` for milestones
