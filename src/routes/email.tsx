import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Wand2 } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { AIOutput } from "@/components/AIOutput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/ai-tools.functions";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Email Generator — Workmate AI" }] }),
  component: EmailPage,
});

const tones = ["Professional", "Friendly", "Persuasive", "Apologetic", "Assertive", "Concise", "Enthusiastic"];

function EmailPage() {
  const fn = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fn({ data: { purpose, audience, tone, keyPoints } });
      setOutput(res.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Smart Email Generator" description="Craft polished emails tuned to your audience and tone." icon={Mail} />
      <div className="px-6 md:px-10 py-8 max-w-5xl grid lg:grid-cols-2 gap-6">
        <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input id="purpose" required value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Request a project deadline extension" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <Input id="audience" required value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. My manager / a prospective client" />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kp">Key points (optional)</Label>
            <Textarea id="kp" rows={4} value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Bullet points or notes you want included" />
          </div>
          <Button type="submit" disabled={loading || !purpose || !audience} className="w-full">
            <Wand2 className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Email"}
          </Button>
        </form>

        <AIOutput text={output} loading={loading} error={error} placeholder="Fill in the form to draft your email." />
      </div>
    </AppShell>
  );
}
