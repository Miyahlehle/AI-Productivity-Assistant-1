import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AIOutput } from "@/components/AIOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { researchTopic } from "@/lib/ai-tools.functions";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research Assistant — Workmate AI" }] }),
  component: ResearchPage,
});

const examples = [
  "Impact of generative AI on customer support teams",
  "Best practices for remote engineering onboarding",
  "Sustainable packaging trends in e-commerce 2025",
];

function ResearchPage() {
  const fn = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setOutput("");
    try {
      const res = await fn({ data: { topic } });
      setOutput(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <PageHeader title="AI Research Assistant" description="Get a structured executive briefing on any topic." icon={Search} />
      <div className="px-6 md:px-10 py-8 max-w-5xl space-y-6">
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Research topic</Label>
            <Input id="topic" required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What do you want to research?" />
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((ex) => (
              <button type="button" key={ex} onClick={() => setTopic(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
                {ex}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={loading || topic.length < 2}>
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? "Researching..." : "Generate Brief"}
          </Button>
        </form>

        <AIOutput text={output} loading={loading} error={error} placeholder="Your executive brief with insights and next steps will appear here." />
      </div>
    </AppShell>
  );
}
