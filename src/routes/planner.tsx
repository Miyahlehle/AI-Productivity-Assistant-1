import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AIOutput } from "@/components/AIOutput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { planTasks } from "@/lib/ai-tools.functions";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Task Planner — Workmate AI" }] }),
  component: PlannerPage,
});

function PlannerPage() {
  const fn = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setOutput("");
    try {
      const res = await fn({ data: { tasks, context } });
      setOutput(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <PageHeader title="AI Task Planner" description="Prioritize and schedule your day with the Eisenhower matrix." icon={ListChecks} />
      <div className="px-6 md:px-10 py-8 max-w-5xl space-y-6">
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tasks">Your tasks (one per line)</Label>
            <Textarea id="tasks" rows={8} required value={tasks} onChange={(e) => setTasks(e.target.value)}
              placeholder={"Review Q3 budget proposal\nReply to client about contract\nPrep slides for Friday demo\nDoctor appointment 3pm"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctx">Context (optional)</Label>
            <Input id="ctx" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. I have a hard deadline tomorrow at 5pm" />
          </div>
          <Button type="submit" disabled={loading || !tasks.trim()}>
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? "Planning..." : "Generate Plan"}
          </Button>
        </form>

        <AIOutput text={output} loading={loading} error={error} placeholder="Your prioritized plan and schedule will appear here." />
      </div>
    </AppShell>
  );
}
