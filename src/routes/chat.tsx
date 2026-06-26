import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AppShell, PageHeader, Disclaimer } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chatbot — AI Workplace Productivity Assistant" }] }),
  component: ChatPage,
});

const STORAGE_KEY = "workmate-chat-messages-v1";

function loadInitial(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ChatPage() {
  const [initial] = useState<UIMessage[]>(() => loadInitial());
  const [input, setInput] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages, error } = useChat({
    id: "workmate-main",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  // Focus
  useEffect(() => { taRef.current?.focus(); }, []);
  useEffect(() => { if (status === "ready") taRef.current?.focus(); }, [status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendMessage({ text });
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const clear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    taRef.current?.focus();
  };

  return (
    <AppShell>
      <PageHeader title="AI Chatbot" description="Conversational assistant for everyday work questions." icon={Bot} />
      <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-105px)] max-w-4xl px-4 md:px-10">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.length === 0 && (
            <div className="grid place-items-center h-full">
              <div className="text-center max-w-md">
                <div className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <Bot className="h-7 w-7" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">How can I help today?</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Ask anything — from drafting messages to brainstorming a strategy.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {[
                    "Help me prep for a 1:1 with my manager",
                    "Explain OKRs vs KPIs in plain English",
                    "Suggest a polite way to decline a meeting",
                    "How do I structure a project kickoff?",
                  ].map((p) => (
                    <button key={p} onClick={() => setInput(p)}
                      className="text-xs text-left p-3 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-colors">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                <div className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                  isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground border border-border"
                )}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                )}>
                  {isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{text}</p>
                  ) : (
                    <div className="prose-ai">
                      <ReactMarkdown>{text || "…"}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent border border-border">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              Something went wrong. Please try again.
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background py-4">
          <form onSubmit={submit} className="rounded-xl border border-border bg-card focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <Textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Message AI Workplace Productivity Assistant..."
              rows={2}
              className="border-0 resize-none focus-visible:ring-0 shadow-none bg-transparent"
            />
            <div className="flex items-center justify-between px-3 pb-2">
              <Button type="button" variant="ghost" size="sm" onClick={clear} disabled={messages.length === 0} className="text-xs h-8">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear chat
              </Button>
              <Button type="submit" size="sm" disabled={!input.trim() || busy} className="h-8">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1.5" /> Send</>}
              </Button>
            </div>
          </form>
          <Disclaimer />
        </div>
      </div>
    </AppShell>
  );
}
