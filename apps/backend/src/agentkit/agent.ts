/**
 * AgentKit primary agent: blunote_companion
 * Orchestrates all conversation, delegates tasks, maintains session memory
 */

import type { AgentSession } from '@blunote/shared';

export interface AgentConfig {
  agentId: string;
  apiKey: string;
  workspaceId: string;
}

export class BluNoteAgent {
  private config: AgentConfig;
  private sessions: Map<string, AgentSession> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
  }

  /**
   * Create new agent session for LTI launch
   */
  async createSession(params: {
    userId: string;
    courseId: string;
    contextId: string;
  }): Promise<AgentSession> {
    const session: AgentSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: this.config.agentId,
      conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: params.userId,
      courseId: params.courseId,
      contextId: params.contextId,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      metadata: {},
    };

    this.sessions.set(session.id, session);
    console.log('[AgentKit] Created session:', session.id);

    // TODO: Initialize AgentKit agent instance
    // TODO: Load conversation history from Supabase if exists

    return session;
  }

  /**
   * Process user message through AgentKit
   */
  async processMessage(params: {
    sessionId: string;
    message: string;
  }): Promise<{ response: string; toolsUsed?: string[] }> {
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error(`Session not found: ${params.sessionId}`);
    }

    // Update last active
    session.lastActiveAt = new Date();

    // TODO: Send message to AgentKit
    // TODO: Execute reasoning chain
    // TODO: Invoke tools as needed
    // TODO: Stream response back

    console.log('[AgentKit] Processing message for session:', params.sessionId);

    // Mock response for now
    return {
      response: `Mock response to: "${params.message}". AgentKit integration coming soon.`,
      toolsUsed: [],
    };
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): AgentSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  cleanupSessions(maxAge: number = 3600000): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActiveAt.getTime() > maxAge) {
        this.sessions.delete(id);
        console.log('[AgentKit] Cleaned up expired session:', id);
      }
    }
  }
}

// Singleton instance
let agentInstance: BluNoteAgent | null = null;

export function initializeAgent(config: AgentConfig): BluNoteAgent {
  if (!agentInstance) {
    agentInstance = new BluNoteAgent(config);
    console.log('[AgentKit] Agent initialized:', config.agentId);
  }
  return agentInstance;
}

export function getAgent(): BluNoteAgent {
  if (!agentInstance) {
    throw new Error('Agent not initialized. Call initializeAgent first.');
  }
  return agentInstance;
}
