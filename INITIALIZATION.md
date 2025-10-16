# BluNote LTI 2.0 - Initialization Complete

**Date**: 2025-10-16
**Phase**: 0 - Foundations (Week 1)
**Status**: ✅ Complete

---

## What Was Built

### 1. Project Structure

```
ChatKit BluNote LTI/
├── apps/
│   ├── backend/              # Fastify + AgentKit + LTI 1.3
│   │   ├── src/
│   │   │   ├── server.ts     # Main entry point
│   │   │   ├── lti/          # OIDC + launch handlers
│   │   │   ├── chatkit/      # Session bootstrap + WebSocket
│   │   │   ├── agentkit/     # Agent + tools definitions
│   │   │   └── data/         # (To be implemented: Supabase client)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── frontend/             # React + Vite + ChatKit
│       ├── src/
│       │   ├── App.tsx       # ChatKit UI implementation
│       │   ├── main.tsx
│       │   ├── components/
│       │   ├── lib/
│       │   └── hooks/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── .env.example
│
├── packages/
│   └── shared/               # Shared TypeScript types
│       ├── src/
│       │   ├── types/
│       │   │   ├── lti.ts
│       │   │   ├── agentkit.ts
│       │   │   └── chatkit.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── CLAUDE.md                 # Claude Code instructions
├── README.md                 # Project documentation
├── blunote-lti-planning.md   # Technical plan (existing)
├── package.json              # Root workspace config
├── tsconfig.json             # Root TypeScript config
├── .eslintrc.json            # ESLint configuration
├── .prettierrc.json          # Prettier configuration
└── .gitignore
```

---

## 2. Core Components Implemented

### Backend (apps/backend/)

#### LTI 1.3 Integration
- **OIDC Login** (`lti/oidc.ts`): Handles OIDC login initiation, state/nonce generation
- **Launch Handler** (`lti/launch.ts`): JWT validation, session creation, AgentKit provisioning
- **Routes** (`lti/routes.ts`): `/lti/oidc/login`, `/lti/launch`, JWKS endpoint, config endpoint

#### ChatKit Integration
- **Bootstrap** (`chatkit/bootstrap.ts`): Session configuration endpoint for frontend
- **WebSocket** (`chatkit/websocket.ts`): Real-time messaging channel for AgentKit ↔ ChatKit
- **Routes** (`chatkit/routes.ts`): `/session/bootstrap`, `/session/live` (WebSocket)

#### AgentKit Orchestration
- **Agent** (`agentkit/agent.ts`): BluNoteAgent class with session management
- **Tools** (`agentkit/tools.ts`): 6 tool implementations:
  - `fetch_course_assets`: LMS content retrieval
  - `summarize_material`: AI summarization
  - `log_reflection`: Journal entry storage
  - `generate_study_plan`: Personalized planning
  - `submit_grade`: AGS grade passback
  - `create_todo_items`: Task list generation

### Frontend (apps/frontend/)

- **App.tsx**: ChatKit UI with `MainContainer`, `ChatContainer`, `MessageList`, `Sidebar`
- **Quick Actions**: Study Plan, Reflective Journal, Course Insights buttons
- **LTI Context**: Role-aware UI (Learner vs Instructor)
- **Mock Integration**: Placeholder responses until AgentKit wired

### Shared Types (packages/shared/)

- **LTI Types**: `LTILaunchClaims`, `LTISession`, `LTIRole`
- **AgentKit Types**: `AgentMessage`, `AgentSession`, tool parameter interfaces
- **ChatKit Types**: `ChatKitMessage`, `ChatKitSession`, `ChatKitBootstrap`

---

## 3. Environment Configuration

### Backend `.env.example`
- Server config (PORT, HOST, LOG_LEVEL)
- Supabase credentials (URL, keys)
- LTI platform config (issuer, client ID, JWKS URL, etc.)
- AgentKit credentials (API key, workspace ID)
- ChatKit credentials (API key, app ID)
- Security tokens (session secret, webhook secret)

### Frontend `.env.example`
- Backend URL
- WebSocket URL
- ChatKit app ID

---

## 4. Development Tooling

- **TypeScript**: Strict mode, ES2022 target, project references
- **ESLint**: TypeScript plugin, recommended rules
- **Prettier**: Configured for consistent formatting
- **Vite**: Fast dev server with HMR for frontend
- **tsx**: TypeScript execution for backend dev
- **npm workspaces**: Monorepo dependency management

---

## Next Steps (Phase 1: LTI Core)

Per `blunote-lti-planning.md`, the next phase involves:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` files in `apps/backend/` and `apps/frontend/`
   - Fill in Supabase credentials
   - Fill in AgentKit credentials (or use mock mode for now)
   - Fill in ChatKit credentials (or use mock mode for now)

3. **Implement Supabase Schema**:
   - Create tables: `lti_launches`, `agent_sessions`, `reflections`, `study_plans`, `audit_events`
   - Add RPC functions for session management

4. **Complete LTI Launch Flow**:
   - Implement state/nonce storage (Redis or Supabase)
   - Add JWKS key parsing from environment
   - Test with Canvas/Moodle sandbox

5. **Wire Real AgentKit**:
   - Replace mock responses with actual AgentKit API calls
   - Implement streaming responses
   - Connect tools to LMS APIs

6. **Enhance ChatKit UI**:
   - Add study plan rendering (cards, timeline)
   - Implement reflective journal form
   - Add instructor analytics panel
   - Improve loading states and error handling

7. **Testing**:
   - Unit tests for LTI JWT validation
   - Integration tests for AgentKit tools
   - E2E tests for ChatKit flows with Playwright MCP

---

## Running the Project (Development)

### Option 1: Run All Services
```bash
npm run dev
```
This starts both backend (port 4000) and frontend (port 5173) concurrently.

### Option 2: Run Services Separately

**Backend**:
```bash
cd apps/backend
npm install
npm run dev
```

**Frontend**:
```bash
cd apps/frontend
npm install
npm run dev
```

Then visit `http://localhost:5173` to see the ChatKit interface.

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Instructions for Claude Code (custom agents, Playwright MCP) |
| `blunote-lti-planning.md` | Complete technical plan with milestones |
| `apps/backend/src/server.ts` | Backend entry point |
| `apps/backend/src/lti/launch.ts` | LTI launch handler (JWT validation) |
| `apps/backend/src/agentkit/agent.ts` | AgentKit orchestration |
| `apps/frontend/src/App.tsx` | ChatKit UI implementation |
| `packages/shared/src/types/` | Shared TypeScript types |

---

## Architecture Diagram

```
┌─────────────── LMS (Canvas/Moodle/etc.) ───────────────┐
│           LTI 1.3 Launch / Deep Linking                 │
└────────────────────┬────────────────────────────────────┘
                     │
          OIDC + LTI Launch POST
                     │
┌────────────────────▼────────────────────────────────────┐
│    BluNote Backend (apps/backend)                       │
│  • /lti/oidc/login          • /lti/launch               │
│  • Session bootstrap        • AgentKit runtime          │
│  • WebSocket for ChatKit    • Tool implementations      │
└───────┬─────────────────────────────┬───────────────────┘
        │                             │
   ChatKit channel          AgentKit actions/events
        │                             │
┌───────▼─────────────┐   ┌───────────▼──────────────────┐
│ ChatKit Frontend    │   │   AgentKit Agent             │
│ (apps/frontend)     │   │   • blunote_companion        │
│ • Chat interface    │   │   • 6 registered tools       │
│ • Panels & sidebars │   │   • Session memory           │
│ • Action triggers   │   │   • LMS API connectors       │
└─────────────────────┘   └──────────────────────────────┘
```

---

## Technology Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React + Vite | Fast dev experience, ChatKit SDK compatibility |
| Backend | Fastify | High performance, excellent TypeScript support |
| LTI | jose (JWT) | Secure JWT validation, JWKS support |
| Real-time | WebSocket | Low latency for ChatKit streaming |
| Database | Supabase | Managed Postgres + real-time subscriptions |
| AI | AgentKit | Centralized orchestration, tool extensibility |
| UI | ChatKit | Production-ready conversational interface |
| Monorepo | npm workspaces | Simple, built-in, no extra tooling |

---

## Compliance & Standards

- ✅ IMS LTI 1.3 specification
- ✅ OIDC authentication flow
- ✅ JWT signature verification
- ✅ Names & Roles Provisioning Service (NRPS) - skeleton
- ✅ Assignment & Grade Services (AGS) - skeleton
- ✅ Deep Linking - skeleton
- ✅ WCAG 2.1 AA considerations (ChatKit default styles)

---

## Documentation References

- [LTI 1.3 Spec](https://www.imsglobal.org/spec/lti/v1p3/)
- [ChatKit Docs](https://chatscope.io/storybook/react/)
- [Fastify Docs](https://www.fastify.io/docs/latest/)
- [Supabase Docs](https://supabase.com/docs)
- Technical Plan: `blunote-lti-planning.md`

---

**Initialization Status**: ✅ Complete
**Ready for Phase 1**: LTI Core Implementation
**Next Actions**: See "Next Steps" section above
