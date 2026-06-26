import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AIOutput } from "@/components/AIOutput";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { summarizeMeeting } from "@/lib/ai-tools.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — AI Workplace Productivity Assistant" }] }),
  component: MeetingPage,
});

function MeetingPage() {
  const fn = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setOutput("");
    try {
      const res = await fn({ data: { notes } });
      setOutput(res.text);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <AppShell>
      <PageHeader title="Meeting Notes Summarizer" description="Turn raw notes or transcripts into a structured summary." icon={FileText} />
      <div className="px-6 md:px-10 py-8 max-w-5xl space-y-6">
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes or transcript</Label>
            <Textarea id="notes" rows={10} required value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste raw meeting notes, bullet points, or full transcript..." />
          </div>
          <Button type="submit" disabled={loading || notes.length < 10}>
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? "Summarizing..." : "Summarize Meeting"}
          </Button>
        </form>

        <AIOutput text={output} loading={loading} error={error} placeholder="Your structured summary, decisions, and action items will appear here." />
      </div>
    </AppShell>
  );
}
