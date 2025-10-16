# MCP Server Setup for OpenAI Agent Builder

## What is MCP?

**Model Context Protocol (MCP)** is the bridge between OpenAI Agent Builder and your backend services. Instead of configuring individual HTTP endpoints, you create an MCP server that exposes all 9 functions as "tools" that the Agent can use.

## Architecture

```
OpenAI Agent Builder
    ↓
MCP Server (apps/backend/src/mcp-server.ts)
    ↓
Your Backend API (http://localhost:4000/api/agentkit/*)
    ↓
Supabase Database
```

## Setup Steps

### 1. Install MCP SDK

```bash
cd apps/backend
npm install @modelcontextprotocol/sdk axios
```

### 2. Add Environment Variables

Add to `apps/backend/.env`:

```env
# MCP Server Configuration
BACKEND_URL=http://localhost:4000
AGENTKIT_API_SECRET=your_secure_random_string_here
```

### 3. Add NPM Script

Add to `apps/backend/package.json` in the `"scripts"` section:

```json
{
  "scripts": {
    "mcp": "tsx src/mcp-server.ts"
  }
}
```

### 4. Start MCP Server

```bash
cd apps/backend
npm run mcp
```

Keep this running - it will listen for requests from OpenAI Agent Builder.

### 5. Connect MCP Server to OpenAI Agent Builder

In the OpenAI Agent Builder interface:

1. Click the **"+"** button under Tools
2. Select **"MCP server"** from the "Hosted" section
3. You'll see a dialog asking for MCP server connection details

**Connection Options:**

#### Option A: Local Development (Recommended for Testing)

If running locally, you'll need to expose your MCP server via ngrok or similar:

```bash
# Install ngrok if you don't have it
brew install ngrok

# Expose your MCP server (running on stdio, not HTTP)
# Note: MCP uses stdio transport, so you may need a different approach
```

**Important:** MCP servers typically run on stdio (standard input/output), which means they communicate via process pipes, not HTTP. OpenAI Agent Builder may require a **hosted MCP server** with HTTP transport.

#### Option B: Deploy MCP Server (Production)

For production, deploy the MCP server to a cloud service that supports persistent connections:

1. **Railway.app**
2. **Render.com**
3. **Fly.io**
4. **AWS Lambda + API Gateway**

Configure the server to use **HTTP transport** instead of stdio:

```typescript
// Modify apps/backend/src/mcp-server.ts
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

// Replace stdio transport with HTTP/SSE
const transport = new SSEServerTransport('/mcp/sse', response);
```

#### Option C: Use OpenAI's Hosted MCP (Simplest)

OpenAI may provide a way to **register your backend API** directly without running a separate MCP server. Check the Agent Builder documentation for:

- **Webhook endpoints**
- **API integration**
- **Custom tools via OpenAPI spec**

If available, you can skip the MCP server and configure each function as a direct HTTP endpoint in the Agent Builder.

---

## RECOMMENDED: Use OpenAI's Native MCP Integration

Since you see an "MCP section" in the Agent Builder, OpenAI has built-in MCP support! Here's what to do:

### Quick Start (Using the MCP Option in Agent Builder)

1. In Agent Builder, click **"+"** under Tools
2. Select **"MCP server"** from the Hosted section
3. You'll need to provide a URL to your MCP server

**Two approaches:**

#### Approach 1: Host MCP Server (Requires Deployment)
- Deploy `apps/backend/src/mcp-server.ts` to a cloud service
- Use HTTP transport instead of stdio
- Provide the URL to Agent Builder (e.g., `https://your-app.com/mcp`)

#### Approach 2: Use Backend API Directly (Simpler)
Since MCP requires hosting, it may be easier to:
1. Skip the MCP server for now
2. Implement the backend API handlers first at `/api/agentkit/*`
3. Use OpenAI's **function calling** with webhooks
4. Configure each function to call your backend directly

### Alternative if MCP is too complex:

You can also manually configure functions:

1. Click **"+"** under Tools
2. Select **"Function"** from the Local section
3. Paste each function from `AGENTKIT-FUNCTIONS.md`
4. Configure webhook URLs for each function

---

## Next Steps

1. **Test MCP Connection**: Verify OpenAI Agent Builder can reach your MCP server
2. **Implement Backend Handlers**: Create the actual API endpoints at `/api/agentkit/*`
3. **Test Each Function**: Send test requests through the Agent Builder interface
4. **Upload Widget**: Once functions work, upload `class-assist.widget`

---

## Troubleshooting

### MCP Server Won't Connect

- Ensure it's running: `npm run mcp`
- Check if stdio transport is supported by Agent Builder
- Try deploying to a hosted service with HTTP transport

### Functions Return Errors

- Check backend API is running: `npm run dev` in `apps/backend`
- Verify `AGENTKIT_API_SECRET` matches in both MCP server and backend
- Check Supabase credentials are correct

### Agent Builder Shows No MCP Option

- MCP support may be in beta - check OpenAI Platform changelog
- Use manual Function configuration as fallback
- Contact OpenAI support to enable MCP for your organization

---

## Status

- [x] MCP server code created
- [x] MCP configuration file created
- [ ] MCP SDK installed
- [ ] MCP server connected to Agent Builder
- [ ] Backend API handlers implemented
- [ ] Functions tested end-to-end
