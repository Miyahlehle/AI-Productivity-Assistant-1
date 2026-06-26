import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { getProvider, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

const SYSTEM = `You are an AI Workplace Productivity Assistant. You help professionals with email drafting, meeting summaries, task planning, research, and general workplace questions. Be concise, structured, and professional. Use markdown formatting (headings, bullets, bold) to organize responses. Always end with a brief note when uncertain.`;

const MAX_BODY_BYTES = 256 * 1024; // 256 KB
const MAX_MESSAGES = 50;
const MAX_PART_CHARS = 8000;

const PartSchema = z
  .object({
    type: z.string().max(64),
    text: z.string().max(MAX_PART_CHARS).optional(),
  })
  .passthrough();

const MessageSchema = z
  .object({
    id: z.string().max(128).optional(),
    role: z.enum(["system", "user", "assistant"]),
    parts: z.array(PartSchema).max(20).optional(),
    content: z.string().max(MAX_PART_CHARS).optional(),
  })
  .passthrough();

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(MAX_MESSAGES),
});

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;
  const allowed = new Set<string>([host]);
  const check = (value: string | null): boolean => {
    if (!value) return false;
    try {
      const u = new URL(value);
      return allowed.has(u.host);
    } catch {
      return false;
    }
  };
  // Require at least one same-origin header to be present and matching.
  if (!origin && !referer) return false;
  if (origin && !check(origin)) return false;
  if (referer && !check(referer)) return false;
  return true;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Same-origin gate: blocks third-party callers from invoking the AI
        // and burning credits. Browser app calls always include Origin.
        if (!isSameOrigin(request)) {
          return new Response("Forbidden", { status: 403 });
        }

        // Enforce payload size cap before reading the body.
        const contentLength = Number(request.headers.get("content-length") ?? "0");
        if (contentLength && contentLength > MAX_BODY_BYTES) {
          return new Response("Payload too large", { status: 413 });
        }

        let raw: unknown;
        try {
          const text = await request.text();
          if (text.length > MAX_BODY_BYTES) {
            return new Response("Payload too large", { status: 413 });
          }
          raw = JSON.parse(text);
        } catch {
          return new Response("Invalid request", { status: 400 });
        }

        const parsed = BodySchema.safeParse(raw);
        if (!parsed.success) {
          return new Response("Invalid request", { status: 400 });
        }
        const messages = parsed.data.messages as UIMessage[];

        try {
          const provider = getProvider();
          const result = streamText({
            model: provider(DEFAULT_MODEL),
            system: SYSTEM,
            messages: await convertToModelMessages(messages),
          });
          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onError: (error) => {
              console.error("[api/chat] stream error", error);
              return "The assistant is temporarily unavailable. Please try again.";
            },
          });
        } catch (error) {
          console.error("[api/chat] handler error", error);
          return new Response("The assistant is temporarily unavailable.", {
            status: 502,
          });
        }
      },
    },
  },
});
