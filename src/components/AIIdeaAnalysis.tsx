import { AIPanel } from "@/components/AIPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Check, CircleAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { IdeaAnalysis } from "@/lib/mockAnalysis";

const STAGES = [
  "Reading the problem statement…",
  "Mapping your idea against the challenge…",
  "Checking for missing elements…",
  "Estimating expected impact…",
];

/** Staged loading state so the wait reads as intentional analysis. */
export function AIAnalysisLoading() {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      700,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <AIPanel title="udbhava is analyzing your idea" icon={<BrainCircuit className="size-3.5 animate-pulse" />}>
      <div className="space-y-3">
        {STAGES.map((s, i) => (
          <div key={s} className="flex items-center gap-2 text-sm">
            {i < stage ? (
              <Check className="size-3.5 text-success" />
            ) : i === stage ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            ) : (
              <span className="size-3.5 rounded-full border border-border" />
            )}
            <span className={i <= stage ? "text-foreground" : "text-muted-foreground/60"}>
              {s}
            </span>
          </div>
        ))}
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </AIPanel>
  );
}

/** Rendered AI analysis of a student's idea. */
export function AIAnalysisResult({
  analysis,
  compact,
}: {
  analysis: IdeaAnalysis;
  compact?: boolean;
}) {
  return (
    <AIPanel title="AI idea analysis" icon={<BrainCircuit className="size-3.5" />}>
      <div className={compact ? "space-y-4" : "space-y-5"}>
        <Section title="Problem understanding">
          <p className="text-sm leading-6 text-foreground">
            {analysis.problemUnderstanding}
          </p>
        </Section>

        <div className={compact ? "space-y-4" : "grid gap-5 md:grid-cols-2"}>
          <Section title="Strengths">
            <ul className="space-y-1.5">
              {analysis.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm leading-6">
                  <Check className="mt-1 size-3.5 shrink-0 text-success" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Missing elements">
            <ul className="space-y-1.5">
              {analysis.missing.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm leading-6">
                  <CircleAlert className="mt-1 size-3.5 shrink-0 text-warning" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="Suggestions for improvement">
          <ol className="space-y-1.5">
            {analysis.suggestions.map((s, i) => (
              <li key={s} className="flex items-start gap-2 text-sm leading-6">
                <span className="mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Expected impact">
          <p className="flex items-start gap-2 text-sm leading-6 text-foreground">
            <Sparkles className="mt-1 size-3.5 shrink-0 text-primary" />
            {analysis.expectedImpact}
          </p>
        </Section>
      </div>
    </AIPanel>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}
