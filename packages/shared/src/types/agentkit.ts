/**
 * AgentKit type definitions
 */

export interface AgentMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AgentSession {
  id: string;
  agentId: string;
  conversationId: string;
  userId: string;
  courseId: string;
  contextId: string;
  createdAt: Date;
  lastActiveAt: Date;
  metadata?: Record<string, unknown>;
}

export type AgentToolName =
  | 'fetch_course_assets'
  | 'summarize_material'
  | 'log_reflection'
  | 'generate_study_plan'
  | 'submit_grade'
  | 'create_todo_items';

export interface FetchCourseAssetsParams {
  course_id: string;
  filters?: {
    type?: string[];
    module?: string;
    limit?: number;
  };
}

export interface SummarizeMaterialParams {
  content_refs: string[];
  audience: 'learner' | 'instructor';
  max_length?: number;
}

export interface LogReflectionParams {
  user_id: string;
  course_id: string;
  payload: {
    title: string;
    content: string;
    module?: string;
    tags?: string[];
  };
}

export interface GenerateStudyPlanParams {
  user_id: string;
  course_id: string;
  duration: number; // in days
  focus_topics?: string[];
}

export interface SubmitGradeParams {
  lms_context: {
    platform_issuer: string;
    line_item_url: string;
  };
  score: number;
  max_score?: number;
  comment?: string;
}

export interface CreateTodoItemsParams {
  user_id: string;
  course_id: string;
  tasks: Array<{
    title: string;
    description?: string;
    due_date?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
}
