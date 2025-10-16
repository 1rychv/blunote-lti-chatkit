import { tool, Agent, AgentInputItem, Runner } from "@openai/agents";
import { z } from "zod";


// Tool definitions
const trackConfusion = tool({
  name: "trackConfusion",
  description: "Record a confusion event when a student clicks the 'I'm Confused' button. Tracks user, course, slide, and timestamp. Returns whether confusion threshold was exceeded.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    slide_id: z.string(),
    topic: z.string(),
    timestamp: z.string()
  }),
  execute: async (input: {user_id: string, course_id: string, slide_id: string, topic: string, timestamp: string}) => {
    // TODO: Unimplemented
  },
});
const submitQuestion = tool({
  name: "submitQuestion",
  description: "Save a student's question to the database. Questions can be anonymous or attributed. Returns confirmation and question ID.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    question_body: z.string(),
    anonymous: z.boolean(),
    slide_id: z.string(),
    topic: z.string()
  }),
  execute: async (input: {user_id: string, course_id: string, question_body: string, anonymous: boolean, slide_id: string, topic: string}) => {
    // TODO: Unimplemented
  },
});
const generateQuiz = tool({
  name: "generateQuiz",
  description: "Generate a personalized quiz for a student based on their confusion zones and learning needs. Returns quiz content with questions and answers.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    focus: z.string(),
    difficulty: z.string(),
    num_questions: z.integer(),
    topics: z.array()
  }),
  execute: async (input: {user_id: string, course_id: string, focus: string, difficulty: string, num_questions: integer, topics: array}) => {
    // TODO: Unimplemented
  },
});
const explainTopic = tool({
  name: "explainTopic",
  description: "Generate a re-explanation of a topic that a student is confused about. Uses different teaching approaches and examples than the original material.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    topic: z.string(),
    explanation_style: z.string(),
    prior_confusion: z.boolean()
  }),
  execute: async (input: {user_id: string, course_id: string, topic: string, explanation_style: string, prior_confusion: boolean}) => {
    // TODO: Unimplemented
  },
});
const fetchNotes = tool({
  name: "fetchNotes",
  description: "Retrieve course notes for a specific slide, topic, or section. Returns formatted notes with metadata.",
  parameters: z.object({
    user_id: z.string(),
    course_id: z.string(),
    slide_id: z.string(),
    topic: z.string(),
    section: z.string(),
    include_personal_notes: z.boolean()
  }),
  execute: async (input: {user_id: string, course_id: string, slide_id: string, topic: string, section: string, include_personal_notes: boolean}) => {
    // TODO: Unimplemented
  },
});
const getConfusionHeatmap = tool({
  name: "getConfusionHeatmap",
  description: "Fetch confusion metrics aggregated by slide/topic for the instructor dashboard. Returns confusion percentages, timestamps, and trends.",
  parameters: z.object({
    course_id: z.string(),
    time_range: z.string(),
    group_by: z.string(),
    include_trends: z.boolean()
  }),
  execute: async (input: {course_id: string, time_range: string, group_by: string, include_trends: boolean}) => {
    // TODO: Unimplemented
  },
});
const exportConfusionData = tool({
  name: "exportConfusionData",
  description: "Export confusion tracking data as CSV or JSON for instructor analysis. Includes timestamps, students (anonymized), slides, and topics.",
  parameters: z.object({
    course_id: z.string(),
    format: z.string(),
    time_range: z.string(),
    include_anonymous: z.boolean(),
    include_metadata: z.boolean()
  }),
  execute: async (input: {course_id: string, format: string, time_range: string, include_anonymous: boolean, include_metadata: boolean}) => {
    // TODO: Unimplemented
  },
});
const notifyStudentsViaLms = tool({
  name: "notifyStudentsViaLms",
  description: "Send notifications to students through the LMS messaging system. Can target confused students, all students, or struggling students.",
  parameters: z.object({
    course_id: z.string(),
    recipient_filter: z.string(),
    user_ids: z.array(),
    subject: z.string(),
    message: z.string(),
    include_resources: z.boolean()
  }),
  execute: async (input: {course_id: string, recipient_filter: string, user_ids: array, subject: string, message: string, include_resources: boolean}) => {
    // TODO: Unimplemented
  },
});
const assignRemedialQuiz = tool({
  name: "assignRemedialQuiz",
  description: "Create and assign remedial quizzes to students who are confused. Automatically grades quizzes and tracks completion.",
  parameters: z.object({
    course_id: z.string(),
    quiz_type: z.string(),
    target_students: z.string(),
    user_ids: z.array(),
    topics: z.array(),
    due_date: z.string(),
    passing_score: z.integer()
  }),
  execute: async (input: {course_id: string, quiz_type: string, target_students: string, user_ids: array, topics: array, due_date: string, passing_score: integer}) => {
    // TODO: Unimplemented
  },
});
const agent = new Agent({
  name: "Agent",
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
  model: "gpt-4-turbo",
  tools: [
    trackConfusion,
    submitQuestion,
    generateQuiz,
    explainTopic,
    fetchNotes,
    getConfusionHeatmap,
    exportConfusionData,
    notifyStudentsViaLms,
    assignRemedialQuiz
  ],
  modelSettings: {
    temperature: 1,
    topP: 1,
    parallelToolCalls: true,
    maxTokens: 2048,
    store: true
  }
});

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const state = {

  };
  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text
        }
      ]
    }
  ];
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68f098cbd02881909ef6081a835dd67d0e9da771c613a7e7"
    }
  });
  const agentResultTemp = await runner.run(
    agent,
    [
      ...conversationHistory
    ]
  );
  conversationHistory.push(...agentResultTemp.newItems.map((item) => item.rawItem));

  if (!agentResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
  }

  const agentResult = {
    output_text: agentResultTemp.finalOutput ?? ""
  };
  return agentResult;
}
