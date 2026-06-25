import ReactMarkdown from "react-markdown";
import { Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "./AppShell";

export function AIOutput({
  text,
  loading,
  error,
  placeholder,
}: {
  text: string;
  loading?: boolean;
  error?: string | null;
  placeholder?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 min-h-[200px] grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">AI is working on it...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!text) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        {placeholder || "Your AI-generated output will appear here."}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          AI Output
        </span>
        <Button size="sm" variant="ghost" onClick={copy} className="h-8">
          {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="px-5 py-4 prose-ai">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
      <div className="px-5 pb-4">
        <Disclaimer />
      </div>
    </div>
  );
}
