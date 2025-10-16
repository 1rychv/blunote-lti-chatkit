# BluNote LTI Plugin 2.0
## ChatKit + AgentKit Technical Plan

**Version:** 2.0  
**Updated:** February 2025  
**Owner:** Ryan Cheneka, BluNote Founder  

---

## Table of Contents
1. [Product Goals](#product-goals)
2. [Guiding Principles](#guiding-principles)
3. [System Overview](#system-overview)
4. [LTI 1.3 Lifecycle](#lti-13-lifecycle)
5. [Frontend: ChatKit Interface](#frontend-chatkit-interface)
6. [Backend: AgentKit Orchestration](#backend-agentkit-orchestration)
7. [Data & Integrations](#data--integrations)
8. [Security & Compliance](#security--compliance)
9. [Developer Experience](#developer-experience)
10. [Milestones & Deliverables](#milestones--deliverables)

---

## 1. Product Goals
- Deliver an LTI 1.3 compliant BluNote experience embedded directly inside partner LMS platforms.
- Use ChatKit to provide a low-friction, conversational UI that surfaces BluNote study assistance, insights, and journaling tools.
- Use AgentKit to encapsulate all AI reasoning, workflows, and system integrations for reliability and faster iteration.
- Support instructor and learner roles with context-aware responses sourced from course materials, prior reflections, and LMS data.
- Target functional parity across Canvas, Moodle, Blackboard, and D2L with a single tool configuration.

---

## 2. Guiding Principles
- **ChatKit first UI:** Minimize custom React; leverage ChatKit primitives for conversations, sidebars, and task panes.
- **AgentKit everywhere:** All AI, retrieval, automations, and LMS-side mutations route through AgentKit agents to keep logic centralized.
- **LTI purity:** Conform strictly to IMS LTI 1.3 (OIDC login, JWT validation, deep linking, names & roles, AGS support).
- **Security by default:** Least-privilege tokens, signed webhooks, encrypted storage, and short-lived sessions.
- **Observable & testable:** Structured logging and deterministic mocks for ChatKit and AgentKit interactions.

---

## 3. System Overview

```
┌───────────────────────────── LMS (Canvas/Moodle/etc.) ─────────────────────────────┐
│                         LTI 1.3 Launch / Deep Linking                               │
└───────────────────────────────┬─────────────────────────────────────────────────────┘
                                │
                       OIDC + LTI Launch POST
                                │
┌───────────────────────────────▼─────────────────────────────────────────────────────┐
│                     BluNote LTI Service (Backend, AgentKit host)                    │
│  • /oidc/login                      • /lti/launch                                   │
│  • Session + token exchange         • AgentKit runtime orchestration               │
│  • AGS & NRPS adapters              • REST + WebSocket for ChatKit                 │
└───────────────┬──────────────────────────────────────────────┬─────────────────────┘
                │                                              │
     ChatKit data channel                              AgentKit actions/events
                │                                              │
┌───────────────▼──────────────────────┐          ┌────────────▼─────────────────────┐
│         ChatKit Frontend (iframe)    │          │     AgentKit Agent(s)            │
│  • Chat interface & panels           │          │  • Retrieval + synthesis          │
│  • Launch-context personalization    │          │  • Workflow automations           │
│  • Action triggers (study plan, etc) │          │  • LMS + BluNote API connectors   │
└──────────────────────────────────────┘          └──────────────────────────────────┘
```

### Primary Components
- **Backend Service:** Node.js/TypeScript (Fastify or Express) hosting LTI launch handlers, ChatKit session bootstrapper, AgentKit runtime, and LMS adapters.
- **ChatKit Frontend Bundle:** Minimal React/TypeScript app mounting ChatKit components, delivered as static assets by the backend.
- **AgentKit Agents:** One orchestrator agent per tool launch; auxiliary function agents for retrieval, journaling, and planning.
- **Supabase/Postgres:** System of record for reflections, cached course context, and audit logs.

---

## 4. LTI 1.3 Lifecycle

### 4.1 Registration & Configuration
- Publish `/.well-known/lticonfig.json` with tool metadata, keyset URL, and capabilities (AGS, NRPS, Deep Linking).
- Maintain per-platform client IDs and deployment IDs; store secrets encrypted.
- Provide installation guides for Canvas, Moodle, Blackboard, and D2L.

### 4.2 Launch Sequence
1. LMS initiates OIDC login to `/oidc/login`.
2. Service validates state, redirects back to LMS authorization endpoint.
3. LMS posts LTI launch JWT to `/lti/launch`.
4. Backend validates JWT (aud, iss, exp, nonce) and resolves key via platform JWKS.
5. Persist launch context (user, roles, course, resource link, custom params).
6. Create secure session (HTTP-only cookie + rotating backend token).
7. Provision AgentKit agent, seed with launch context + prior chat history.
8. Return HTML/JS for ChatKit app with signed session token.

### 4.3 Deep Linking (Optional)
- Support `/lti/deeplink` to allow instructors to insert BluNote tool links.
- Expose ChatKit preview UI for selecting activity templates (study planner, reflective journal).

### 4.4 Grade Return & Outcomes
- Implement Assignment and Grade Services (AGS) minimal scope.
- AgentKit can trigger grade submissions through backend endpoints when workflows produce graded artifacts.

---

## 5. Frontend: ChatKit Interface

### 5.1 Architecture
- Single-page React entry mounting ChatKit `ChatApp`.
- Store LTI launch payload in context; hydrate via signed bootstrap JSON.
- Use ChatKit `MessageList`, `Composer`, `Sidebar`, `Panel`, and `ActionBar` components.
- WebSocket connection back to backend for streaming responses and event updates.

### 5.2 Feature Modules
- **Conversational Assistant:** Default thread for Q&A tied to course topics and user role.
- **Study Plan Generator:** Action button triggers AgentKit workflow; results rendered as structured cards.
- **Reflective Journal:** Guided prompts, ability to save entries to Supabase and optionally submit to LMS gradebook.
- **Insights Sidebar:** Displays course materials, announcements, and AgentKit recommendations.
- **Instructor Tools:** When `role=Instructor`, show analytics panel summarizing student sentiment or reflection stats.

### 5.3 UX Considerations
- Responsive layout optimized for LMS iframe constraints (min width 720px).
- Persistent conversation history across sessions using AgentKit conversation IDs.
- Loading skeletons and optimistic message posting for latency hiding.
- WCAG 2.1 AA compliance (contrast, focus states, aria labels).

### 5.4 Frontend Integration Points
- `GET /session/bootstrap`: returns ChatKit config, AgentKit channel IDs, and feature flags.
- `WS /session/live`: streaming channel for AgentKit messages, task updates.
- `POST /journal`: saves reflective entries; called from ChatKit form actions.

---

## 6. Backend: AgentKit Orchestration

### 6.1 Service Layout
- `src/server.ts`: Fastify/Express server setup, security middleware, error handling.
- `src/lti/`: OIDC, JWT validation, deep linking responses, AGS adapters.
- `src/chatkit/`: Session bootstrap, message relay endpoints, WebSocket broker.
- `src/agentkit/`: Agent definitions, tool registrations, event bus.
- `src/data/`: Supabase client, repositories, caching helpers.

### 6.2 AgentKit Design
- **Primary Agent:** `blunote_companion` orchestrates conversation, delegates tasks, tracks session memory.
- **Tools/Functions:**
  - `fetch_course_assets(course_id, filters)`
  - `summarize_material(content_refs, audience)`
  - `log_reflection(user_id, course_id, payload)`
  - `generate_study_plan(user_id, course_id, duration, focus_topics[])`
  - `submit_grade(lms_context, score, payload)` (wraps AGS)
  - `create_todo_items(user_id, course_id, tasks[])`
- **Knowledge Sources:** Supabase content, LMS REST APIs, uploaded documents (ingested to vector store).
- **Memory Strategy:** AgentKit conversation state persisted keyed by `context_id` + `user_id`.

### 6.3 Runtime Flow
1. ChatKit sends user message to backend.
2. Backend posts message event to AgentKit.
3. AgentKit executes reasoning chain, invokes functions.
4. Results stream back through backend to ChatKit for rendering.
5. Side effects (grade update, journal save) pass through backend adapters with audit logging.

### 6.4 Reliability
- Use AgentKit retries and circuit breakers for LMS API calls.
- Centralized error boundary returning user-friendly ChatKit notifications.
- Dead-letter queue (Redis/SQS) for failed workflows requiring manual review.

---

## 7. Data & Integrations

### 7.1 Storage
- **Supabase/Postgres Tables:**
  - `lti_launches`: store launch JWT claims, course/user mapping.
  - `agent_sessions`: AgentKit session metadata and last active timestamp.
  - `reflections`: user journals, tagged by course/module.
  - `study_plans`: generated plans, tasks list, completion state.
  - `audit_events`: security and compliance logging.

### 7.2 External APIs
- **LMS APIs:** Canvas, Moodle, Blackboard, D2L (use platform-specific clients; scope tokens per deployment).
- **Document Indexing:** Optional vector store (Pinecone/Supabase pgvector) for knowledge retrieval.
- **Notification Channels:** Email or LMS announcements (phase 2).

### 7.3 Caching Strategy
- Cache LMS course metadata per launch (TTL 5 minutes).
- Cache AgentKit knowledge retrieval responses for repeated questions within a session.
- Use ETag-aware fetchers when pulling LMS files to avoid duplication.

---

## 8. Security & Compliance
- Rotate LTI platform keys annually; automate JWKS refresh.
- Enforce HTTPS everywhere; HSTS for hosted domain.
- Content Security Policy tightened to ChatKit + AgentKit hosts.
- Validate all inbound AgentKit webhooks/events with HMAC signatures.
- GDPR/FERPA alignment: allow deletion of user reflections upon request; store minimal PII.
- Log redaction for sensitive LMS fields; segregate analytics vs. raw content storage.
- Regular penetration tests and dependency audits (e.g., `npm audit`, Snyk).

---

## 9. Developer Experience
- **Monorepo Structure:** `apps/backend`, `apps/frontend`, `packages/shared`.
- **Local Dev Flow:**
  - Run `npm run dev:lti` to start backend with mock LTI issuer.
  - Use provided LMS simulator scripts to generate test launches.
  - ChatKit simulator harness to replay AgentKit transcripts.
- **Testing Strategy:**
  - Unit tests for LTI handlers and AgentKit function resolvers (Jest/Vitest).
  - Contract tests for AgentKit tools (mocked external APIs).
  - Cypress or Playwright smoke tests for ChatKit UI flows.
  - End-to-end tests using IMS reference implementation.
- **Observability:**
  - Structured logs (pino/winston) with correlation IDs.
  - Metrics via Prometheus/OpenTelemetry (request latency, agent execution time).
  - Alerting thresholds for launch errors, AgentKit failures, and LMS API rate limits.

---

## 10. Milestones & Deliverables

| Phase | Focus | Deliverables |
|-------|-------|--------------|
| 0. Foundations (Week 1) | Repo scaffolding, infra setup | Monorepo scaffold, basic backend server, `.env` templates |
| 1. LTI Core (Weeks 2-3) | OIDC login + launch, session bootstrap | Validated launch flow, session store, ChatKit bootstrap endpoint |
| 2. ChatKit Shell (Weeks 3-4) | Frontend wiring with mock AgentKit | ChatKit UI with placeholder data, WebSocket loopback |
| 3. AgentKit MVP (Weeks 4-5) | Core workflows & functions | AgentKit agent with study plan + reflection tools, Supabase integration |
| 4. LMS Integrations (Weeks 6-7) | Canvas + generic AGS | Grade return, roster fetch, file retrieval |
| 5. Pilot Readiness (Weeks 8-9) | QA, accessibility, security review | Automated tests, accessibility audit, deployment to staging |
| 6. Pilot Launch (Week 10) | First live course | Production deployment, monitoring dashboards, feedback loop |

### Near-Term Action Items
- [ ] Initialize backend project with LTI 1.3 launch validator.
- [ ] Set up AgentKit workspace and register required tools/functions.
- [ ] Prototype ChatKit frontend with real-time messaging against mocked AgentKit responses.
- [ ] Configure Supabase schema and seed data fixtures for dev.
- [ ] Prepare Canvas sandbox tenant for integration testing.

---

**Document Status:** Living specification — update as ChatKit/AgentKit APIs evolve and pilot feedback arrives.  
**Next Review:** Prior to Phase 3 (ChatKit Shell).  
