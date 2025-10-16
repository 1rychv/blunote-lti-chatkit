import { tool, Agent, AgentInputItem, Runner } from "@openai/agents";
import { z } from "zod";
import { supabase } from "../db/supabase";

// Tool definitions with actual implementations

const trackConfusion = tool({
  name: "trackConfusion",
  description: "Record a confusion event when a student clicks the 'I'm Confused' button. Tracks user, course, slide, and timestamp. Returns whether confusion threshold was exceeded.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    slide_id: z.string().nullable(),
    topic: z.string().nullable(),
    timestamp: z.string()
  }),
  execute: async (input: {
    user_id: string;
    course_id: string;
    slide_id?: string;
    topic?: string;
    timestamp: string;
  }) => {
    try {
      // Insert confusion event into database
      const { data, error } = await supabase
        .from('confusion_events')
        .insert({
          user_id: input.user_id,
          course_id: input.course_id,
          slide_id: input.slide_id || null,
          topic: input.topic || null,
          timestamp: input.timestamp,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Check if threshold exceeded (25% of students confused in last 2 minutes)
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

      const { count: confusedCount } = await supabase
        .from('confusion_events')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', input.course_id)
        .gte('timestamp', twoMinutesAgo);

      const { count: totalStudents } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', input.course_id);

      const confusionPercentage = totalStudents ? (confusedCount || 0) / totalStudents * 100 : 0;
      const thresholdExceeded = confusionPercentage > 25;

      return {
        success: true,
        event_id: data.id,
        confusion_percentage: confusionPercentage,
        threshold_exceeded: thresholdExceeded,
        message: thresholdExceeded
          ? `⚠️ Confusion spike detected: ${confusionPercentage.toFixed(1)}% of students confused`
          : `Confusion tracked: ${confusionPercentage.toFixed(1)}% of students confused`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const submitQuestion = tool({
  name: "submitQuestion",
  description: "Save a student's question to the database. Questions can be anonymous or attributed. Returns confirmation and question ID.",
  parameters: z.object({
    user_id: z.string().nullable(),
    course_id: z.string(),
    question_body: z.string(),
    anonymous: z.boolean().default(true),
    slide_id: z.string().nullable(),
    topic: z.string().nullable()
  }),
  execute: async (input: {
    user_id?: string;
    course_id: string;
    question_body: string;
    anonymous?: boolean;
    slide_id?: string;
    topic?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('student_questions')
        .insert({
          user_id: input.anonymous ? null : input.user_id,
          course_id: input.course_id,
          question_body: input.question_body,
          anonymous: input.anonymous ?? true,
          slide_id: input.slide_id || null,
          topic: input.topic || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        question_id: data.id,
        message: input.anonymous
          ? "Your anonymous question has been submitted"
          : "Your question has been submitted"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const generateQuiz = tool({
  name: "generateQuiz",
  description: "Generate a personalized quiz for a student based on their confusion zones and learning needs. Returns quiz content with questions and answers.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    focus: z.enum(["confusion-zones", "recent-topics", "comprehensive", "specific-topic"]),
    difficulty: z.enum(["easy", "medium", "hard", "adaptive"]).default("adaptive"),
    num_questions: z.number().int().default(5),
    topics: z.array(z.string()).nullable()
  }),
  execute: async (input: {
    user_id: string;
    course_id: string;
    focus: string;
    difficulty?: string;
    num_questions?: number;
    topics?: string[];
  }) => {
    try {
      // TODO: Integrate with OpenAI to generate quiz based on confusion data
      // For now, return a placeholder

      const { data: confusionData } = await supabase
        .from('confusion_events')
        .select('topic')
        .eq('user_id', input.user_id)
        .eq('course_id', input.course_id)
        .order('created_at', { ascending: false })
        .limit(10);

      const confusedTopics = confusionData?.map(e => e.topic).filter(Boolean) || [];

      return {
        success: true,
        quiz: {
          title: `Personalized Quiz - ${input.focus}`,
          focus: input.focus,
          difficulty: input.difficulty || "adaptive",
          num_questions: input.num_questions || 5,
          topics: input.topics || confusedTopics,
          questions: [] // TODO: Generate actual questions
        },
        message: `Quiz generated with ${input.num_questions || 5} questions focusing on ${input.focus}`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const explainTopic = tool({
  name: "explainTopic",
  description: "Generate a re-explanation of a topic that a student is confused about. Uses different teaching approaches and examples than the original material.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    topic: z.string(),
    explanation_style: z.enum(["simple", "detailed", "example-based", "visual", "analogy"]).default("simple"),
    prior_confusion: z.boolean().nullable()
  }),
  execute: async (input: {
    user_id: string;
    course_id: string;
    topic: string;
    explanation_style?: string;
    prior_confusion?: boolean;
  }) => {
    try {
      // TODO: Use OpenAI to generate actual explanation
      // For now, return placeholder

      return {
        success: true,
        topic: input.topic,
        explanation_style: input.explanation_style || "simple",
        explanation: `This is a placeholder explanation for "${input.topic}" using ${input.explanation_style || "simple"} style.`,
        message: "Explanation generated successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const fetchNotes = tool({
  name: "fetchNotes",
  description: "Retrieve course notes for a specific slide, topic, or section. Returns formatted notes with metadata.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    slide_id: z.string().nullable(),
    topic: z.string().nullable(),
    section: z.string().nullable(),
    include_personal_notes: z.boolean().default(true)
  }),
  execute: async (input: {
    user_id: string;
    course_id: string;
    slide_id?: string;
    topic?: string;
    section?: string;
    include_personal_notes?: boolean;
  }) => {
    try {
      let query = supabase
        .from('course_notes')
        .select('*')
        .eq('course_id', input.course_id);

      if (input.slide_id) query = query.eq('slide_id', input.slide_id);
      if (input.topic) query = query.eq('topic', input.topic);
      if (input.section) query = query.eq('section', input.section);

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        notes: data || [],
        count: data?.length || 0,
        message: `Found ${data?.length || 0} notes`
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const getConfusionHeatmap = tool({
  name: "getConfusionHeatmap",
  description: "Fetch confusion metrics aggregated by slide/topic for the instructor dashboard. Returns confusion percentages, timestamps, and trends.",
  parameters: z.object({
    course_id: z.string(),
    time_range: z.enum(["last_hour", "today", "this_week", "this_month", "all_time"]).default("today"),
    group_by: z.enum(["slide", "topic", "section", "lecture"]).default("slide"),
    include_trends: z.boolean().default(true)
  }),
  execute: async (input: {
    course_id: string;
    time_range?: string;
    group_by?: string;
    include_trends?: boolean;
  }) => {
    try {
      // Calculate time range
      const now = new Date();
      let startTime: string;

      switch (input.time_range) {
        case "last_hour":
          startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
          break;
        case "today":
          startTime = new Date(now.setHours(0, 0, 0, 0)).toISOString();
          break;
        case "this_week":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "this_month":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          startTime = new Date(0).toISOString();
      }

      const { data, error } = await supabase
        .from('confusion_events')
        .select('*')
        .eq('course_id', input.course_id)
        .gte('timestamp', startTime);

      if (error) throw error;

      // Group by specified field
      const groupedData: Record<string, any> = {};
      data?.forEach(event => {
        const key = event[input.group_by || 'slide'] || 'unknown';
        if (!groupedData[key]) {
          groupedData[key] = { count: 0, students: new Set() };
        }
        groupedData[key].count++;
        groupedData[key].students.add(event.user_id);
      });

      const heatmap = Object.entries(groupedData).map(([key, value]: [string, any]) => ({
        [input.group_by || 'slide']: key,
        confusion_count: value.count,
        unique_students: value.students.size
      }));

      return {
        success: true,
        heatmap,
        total_events: data?.length || 0,
        time_range: input.time_range || "today",
        group_by: input.group_by || "slide"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const exportConfusionData = tool({
  name: "exportConfusionData",
  description: "Export confusion tracking data as CSV or JSON for instructor analysis. Includes timestamps, students (anonymized), slides, and topics.",
  parameters: z.object({
    course_id: z.string(),
    format: z.enum(["csv", "json"]).default("csv"),
    time_range: z.string().nullable(),
    include_anonymous: z.boolean().default(true),
    include_metadata: z.boolean().default(true)
  }),
  execute: async (input: {
    course_id: string;
    format?: string;
    time_range?: string;
    include_anonymous?: boolean;
    include_metadata?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('confusion_events')
        .select('*')
        .eq('course_id', input.course_id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // TODO: Convert to CSV or JSON format
      return {
        success: true,
        format: input.format || "csv",
        data: data || [],
        count: data?.length || 0,
        download_url: null // TODO: Generate S3 signed URL
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const notifyStudentsViaLms = tool({
  name: "notifyStudentsViaLms",
  description: "Send notifications to students through the LMS messaging system. Can target confused students, all students, or struggling students.",
  parameters: z.object({
    course_id: z.string(),
    recipient_filter: z.enum(["confused_students", "all_students", "struggling_students", "specific_users"]),
    user_ids: z.array(z.string()).nullable(),
    subject: z.string(),
    message: z.string(),
    include_resources: z.boolean().default(true)
  }),
  execute: async (input: {
    course_id: string;
    recipient_filter: string;
    user_ids?: string[];
    subject: string;
    message: string;
    include_resources?: boolean;
  }) => {
    try {
      // TODO: Implement LMS notification via LTI messaging
      return {
        success: true,
        recipients_count: input.user_ids?.length || 0,
        message: "Notifications sent successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

const assignRemedialQuiz = tool({
  name: "assignRemedialQuiz",
  description: "Create and assign remedial quizzes to students who are confused. Automatically grades quizzes and tracks completion.",
  parameters: z.object({
    course_id: z.string(),
    quiz_type: z.enum(["remedial", "practice", "assessment"]),
    target_students: z.enum(["confused_students", "all_students", "specific_users"]),
    user_ids: z.array(z.string()).nullable(),
    topics: z.array(z.string()),
    due_date: z.string().nullable(),
    passing_score: z.number().int().default(70)
  }),
  execute: async (input: {
    course_id: string;
    quiz_type: string;
    target_students: string;
    user_ids?: string[];
    topics: string[];
    due_date?: string;
    passing_score?: number;
  }) => {
    try {
      // TODO: Implement quiz assignment via LTI AGS
      return {
        success: true,
        quiz_id: null, // TODO: Generate quiz
        assigned_to: input.user_ids?.length || 0,
        message: "Quiz assignment created successfully"
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  },
});

// Create the agent
export const blunoteAgent = new Agent({
  name: "BluNote Companion",
  instructions: `You are the BluNote Companion, an AI assistant embedded in Learning Management Systems (LMS) to help students and instructors with real-time confusion tracking and personalized learning support.

Your primary responsibilities:

FOR STUDENTS:
- Track confusion signals and provide personalized support
- Answer questions about course material (anonymously by default)
- Generate personalized quizzes based on confusion zones
- Provide re-explanations of difficult topics
- Retrieve and summarize course notes

FOR INSTRUCTORS:
- Provide real-time confusion heatmaps by slide/topic
- Alert when confusion threshold is exceeded (>25% of active students)
- Export confusion data for analysis
- Send targeted notifications to struggling students via LMS
- Assign remedial quizzes to confused students

BEHAVIOR GUIDELINES:
- Always maintain student anonymity by default (FERPA/GDPR compliant)
- Be encouraging and supportive, never judgmental
- Provide concise, actionable responses
- Use the provided functions to interact with the LMS and database
- When confusion spikes, suggest concrete interventions

CONTEXT:
- You have access to course content, slides, assignments, and student progress
- You can track which topics cause the most confusion
- You can see real-time classroom engagement metrics
- You operate within the LTI 1.3 framework for secure LMS integration`,
  model: "gpt-4o-mini", // Much faster and 60x cheaper than gpt-4-turbo
  tools: [
    // Only include essential tools for basic chat
    // Remove complex tools that slow down simple conversations
    explainTopic,
    fetchNotes,
  ],
  modelSettings: {
    temperature: 0.7, // Lower for more consistent responses
    topP: 1,
    parallelToolCalls: false, // Disable for speed
    maxTokens: 500, // Limit response length for speed/cost
    store: false // Disable storage to reduce overhead
  }
});

// Workflow execution function
export interface WorkflowInput {
  input_as_text: string;
  user_id?: string;
  course_id?: string;
  role?: 'student' | 'instructor';
}

export const runWorkflow = async (workflow: WorkflowInput) => {
  // Build context string to prepend to the message
  let contextStr = '';
  if (workflow.user_id) contextStr += `[USER_ID: ${workflow.user_id}] `;
  if (workflow.course_id) contextStr += `[COURSE_ID: ${workflow.course_id}] `;
  if (workflow.role) contextStr += `[ROLE: ${workflow.role}] `;

  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: contextStr + workflow.input_as_text
        }
      ]
    }
  ];

  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68f098cbd02881909ef6081a835dd67d0e9da771c613a7e7",
      user_id: workflow.user_id,
      course_id: workflow.course_id,
      role: workflow.role
    }
  });

  const agentResultTemp = await runner.run(blunoteAgent, conversationHistory);
  conversationHistory.push(...agentResultTemp.newItems.map((item) => item.rawItem));

  if (!agentResultTemp.finalOutput) {
    throw new Error("Agent result is undefined");
  }

  const agentResult = {
    output_text: agentResultTemp.finalOutput ?? "",
    tool_calls: agentResultTemp.newItems.filter(item => item.rawItem.role === 'tool')
  };

  return agentResult;
};
