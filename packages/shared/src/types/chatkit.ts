/**
 * ChatKit integration types
 */

export interface ChatKitMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    agentToolUsed?: string;
    confidence?: number;
    sources?: string[];
  };
}

export interface ChatKitSession {
  sessionId: string;
  conversationId: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  role: 'Learner' | 'Instructor';
  agentId: string;
}

export interface ChatKitBootstrap {
  session: ChatKitSession;
  initialMessages: ChatKitMessage[];
  features: {
    studyPlan: boolean;
    reflection: boolean;
    insights: boolean;
    gradeSubmission: boolean;
  };
  wsUrl: string;
}

export interface ChatKitAction {
  type: 'study_plan' | 'reflection' | 'insights' | 'tutoring';
  label: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}
