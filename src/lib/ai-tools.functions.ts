import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getProvider, DEFAULT_MODEL } from "./ai-gateway.server";

async function runPrompt(system: string, prompt: string) {
  try {
    const provider = getProvider();
    const { text } = await generateText({
      model: provider(DEFAULT_MODEL),
      system,
      prompt,
    });
    return { text };
  } catch (error) {
    console.error("[ai-tools] generation failed", error);
    throw new Error("The assistant is temporarily unavailable. Please try again.");
  }
}

// --- Email Generator ---
const EmailInput = z.object({
  purpose: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  keyPoints: z.string().optional().default(""),
});
export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an expert business communication writer. Produce polished, ready-to-send emails. Output ONLY the email in this exact markdown format:

**Subject:** <subject line>

<greeting>

<body paragraphs>

<sign-off>

Keep it tight, audience-appropriate, and action-oriented. No preamble, no explanation.`;
    const prompt = `Write an email.
Purpose: ${data.purpose}
Audience: ${data.audience}
Tone: ${data.tone}
Key points to include: ${data.keyPoints || "(none specified)"}`;
    return runPrompt(system, prompt);
  });

// --- Meeting Summarizer ---
const MeetingInput = z.object({ notes: z.string().min(10) });
export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an expert meeting analyst. Given raw meeting notes or a transcript, produce a clean, structured summary in markdown with EXACTLY these sections:

## Summary
A 2-3 sentence overview.

## Key Discussion Points
- bullet list of the main topics with brief context

## Decisions Made
- bullet list (or "None recorded")

## Action Items
| Owner | Action | Deadline |
|-------|--------|----------|
| ... | ... | ... |

## Open Questions
- bullet list (or "None")

Be specific. Infer owners and deadlines only when explicitly mentioned; otherwise write "Unassigned" or "TBD".`;
    return runPrompt(system, `Meeting notes:\n\n${data.notes}`);
  });

// --- Task Planner ---
const TaskInput = z.object({
  tasks: z.string().min(1),
  context: z.string().optional().default(""),
});
export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TaskInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a productivity coach using the Eisenhower matrix and time-blocking. Given a raw task list, produce a prioritized plan in markdown with these sections:

## Prioritized Plan

### 🔴 Do First (Urgent & Important)
- task — *why this is critical, est. time*

### 🟡 Schedule (Important, Not Urgent)
- task — *why, est. time*

### 🔵 Delegate (Urgent, Not Important)
- task — *suggested delegate / approach*

### ⚪ Eliminate or Defer
- task — *why deprioritize*

## Suggested Today's Schedule
| Time Block | Task | Duration |
|------------|------|----------|
| 9:00–10:30 | ... | 90 min |

## Tips
- 1-3 short, actionable productivity tips tailored to this workload.`;
    const prompt = `Tasks:\n${data.tasks}\n\nContext: ${data.context || "(none)"}`;
    return runPrompt(system, prompt);
  });

// --- Research Assistant ---
const ResearchInput = z.object({ topic: z.string().min(2) });
export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a research analyst producing executive briefings. Given a topic, output a structured markdown brief with these sections:

## Executive Summary
A 3-4 sentence overview.

## Key Insights
- 4-6 substantive bullet points with concrete details.

## Background & Context
2-3 short paragraphs.

## Opportunities
- bullets

## Risks & Considerations
- bullets

## Recommended Next Steps
1. numbered list of 3-5 actions

Be specific, factual, and avoid filler. If the topic is recent and may have changed, note "Based on training knowledge — verify with current sources."`;
    return runPrompt(system, `Topic: ${data.topic}`);
  });
