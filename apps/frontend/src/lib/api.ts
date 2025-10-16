// API client for BluNote backend

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export interface ChatRequest {
  message: string;
  user_id?: string;
  course_id?: string;
  role?: 'student' | 'instructor';
}

export interface ChatResponse {
  success: boolean;
  response: string;
  tool_calls: any[];
  error?: string;
}

/**
 * Send a message to the BluNote agent
 */
export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Track a confusion event
 */
export async function trackConfusion(params: {
  user_id: string;
  course_id: string;
  topic?: string;
  slide_id?: string;
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Track my confusion${params.topic ? ` about ${params.topic}` : ''}`,
    user_id: params.user_id,
    course_id: params.course_id,
    role: 'student',
  });
}

/**
 * Submit a question
 */
export async function submitQuestion(params: {
  user_id: string;
  course_id: string;
  question: string;
  anonymous?: boolean;
  topic?: string;
  slide_id?: string;
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Save this question: ${params.question}`,
    user_id: params.anonymous ? undefined : params.user_id,
    course_id: params.course_id,
    role: 'student',
  });
}

/**
 * Request a quiz
 */
export async function generateQuiz(params: {
  user_id: string;
  course_id: string;
  focus: 'confusion-zones' | 'recent-topics' | 'comprehensive' | 'specific-topic';
  topic?: string;
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Generate a quiz focused on ${params.focus}${params.topic ? ` for ${params.topic}` : ''}`,
    user_id: params.user_id,
    course_id: params.course_id,
    role: 'student',
  });
}

/**
 * Request topic explanation
 */
export async function explainTopic(params: {
  user_id: string;
  course_id: string;
  topic: string;
  style?: 'simple' | 'detailed' | 'example-based' | 'visual' | 'analogy';
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Explain ${params.topic}${params.style ? ` using ${params.style} style` : ''}`,
    user_id: params.user_id,
    course_id: params.course_id,
    role: 'student',
  });
}

/**
 * Fetch course notes
 */
export async function fetchNotes(params: {
  user_id: string;
  course_id: string;
  topic?: string;
  slide_id?: string;
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Show me notes${params.topic ? ` for ${params.topic}` : ''}${params.slide_id ? ` from slide ${params.slide_id}` : ''}`,
    user_id: params.user_id,
    course_id: params.course_id,
    role: 'student',
  });
}

/**
 * Get confusion heatmap (instructor only)
 */
export async function getConfusionHeatmap(params: {
  user_id: string;
  course_id: string;
  time_range?: 'last_hour' | 'today' | 'this_week' | 'this_month' | 'all_time';
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Show confusion heatmap for ${params.time_range || 'today'}`,
    user_id: params.user_id,
    course_id: params.course_id,
    role: 'instructor',
  });
}

/**
 * Export confusion data (instructor only)
 */
export async function exportConfusionData(params: {
  user_id: string;
  course_id: string;
  format?: 'csv' | 'json';
}): Promise<ChatResponse> {
  return sendMessage({
    message: `Export confusion data as ${params.format || 'csv'}`,
    user_id: params.user_id,
    course_id: params.course_id,
    role: 'instructor',
  });
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; agent: string; functions: number }> {
  const response = await fetch(`${API_BASE_URL}/api/chat/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`);
  }
  return response.json();
}
