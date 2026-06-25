import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

const SYSTEM = `You are an AI Workplace Productivity Assistant. You help professionals with email drafting, meeting summaries, task planning, research, and general workplace questions. Be concise, structured, and professional. Use markdown formatting (headings, bullets, bold) to organize responses. Always end with a brief note when uncertain.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const provider = getProvider();
        const result = streamText({
          model: provider(DEFAULT_MODEL),
          system: SYSTEM,
          messages: convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
