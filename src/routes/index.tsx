import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, ListChecks, Search, Bot, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Workmate AI — Workplace Productivity Assistant" },
      { name: "description", content: "AI-powered tools to draft emails, summarize meetings, plan tasks, research topics, and answer workplace questions." },
    ],
  }),
  component: Dashboard,
});

const tools = [
  { to: "/email", title: "Smart Email Generator", desc: "Tone & audience-tuned email drafts in seconds.", icon: Mail, color: "from-blue-500/15 to-blue-500/5", iconColor: "text-blue-600 dark:text-blue-400" },
  { to: "/meetings", title: "Meeting Summarizer", desc: "Extract key points, decisions, and action items.", icon: FileText, color: "from-emerald-500/15 to-emerald-500/5", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { to: "/planner", title: "AI Task Planner", desc: "Prioritize and schedule using the Eisenhower matrix.", icon: ListChecks, color: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-600 dark:text-amber-400" },
  { to: "/research", title: "Research Assistant", desc: "Executive briefings with insights & next steps.", icon: Search, color: "from-violet-500/15 to-violet-500/5", iconColor: "text-violet-600 dark:text-violet-400" },
  { to: "/chat", title: "AI Chatbot", desc: "Conversational assistant for any workplace question.", icon: Bot, color: "from-pink-500/15 to-pink-500/5", iconColor: "text-pink-600 dark:text-pink-400" },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-8 md:py-12 max-w-6xl">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="h-3 w-3" />
            Powered by AI
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Your AI co-worker for everyday tasks
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Draft emails, summarize meetings, plan your day, and research topics — all from one clean workspace.
          </p>
        </div>

        {/* Tools grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${t.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className={`grid h-10 w-10 place-items-center rounded-lg bg-background border border-border ${t.iconColor} mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base mb-1">{t.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    Open tool
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Feature strip */}
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: "Fast", desc: "Get structured outputs in seconds." },
            { icon: Sparkles, title: "Professional", desc: "Outputs designed for workplace use." },
            { icon: Shield, title: "Human-in-loop", desc: "AI assists; you stay in control." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-lg border border-border bg-card/50 p-4 flex gap-3">
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-xs text-muted-foreground italic">
          AI-generated content may require human review.
        </p>
      </div>
    </AppShell>
  );
}
