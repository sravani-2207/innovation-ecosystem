import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SkillBadge } from "@/components/badges";
import { AIPanel } from "@/components/AIPanel";
import { BrainCircuit } from "lucide-react";
import type { Doc } from "@/convex/_generated/dataModel";

type Challenge = Doc<"challenges">;

/** Full AI Challenge Analyzer output, organized for humans. */
export function AIAnalysisView({ challenge }: { challenge: Challenge }) {
  const sp = challenge.subProblems;
  if (!sp || sp.length === 0) {
    return (
      <AIPanel title="AI Challenge Analysis" icon={<BrainCircuit className="size-3.5" />}>
        <p className="text-sm text-muted-foreground">
          No AI analysis yet. The organization can generate one from the
          challenge editor.
        </p>
      </AIPanel>
    );
  }
  return (
    <AIPanel title="AI Challenge Analysis" icon={<BrainCircuit className="size-3.5" />}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {sp.flatMap((s) => s.skills).filter((s, i, a) => a.indexOf(s) === i).map((s) => (
            <SkillBadge key={s} skill={s} />
          ))}
        </div>
        <Accordion type="single" collapsible className="rounded-lg bg-card/70 px-4">
          {sp.map((s, i) => (
            <AccordionItem key={i} value={`sp-${i}`} className="border-border/60">
              <AccordionTrigger className="py-3 text-left text-sm font-semibold text-foreground hover:no-underline">
                <span className="flex items-baseline gap-2">
                  <span className="text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-2.5 text-sm text-muted-foreground">
                <p className="leading-6">{s.description}</p>
                <p className="leading-6">
                  <span className="font-medium text-foreground">Why it matters: </span>
                  {s.whyItMatters}
                </p>
                <p className="leading-6">
                  <span className="font-medium text-foreground">Technical direction: </span>
                  {s.direction}
                </p>
                {s.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.skills.map((sk) => (
                      <SkillBadge key={sk} skill={sk} />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {challenge.analysisSummary && (
          <p className="text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">AI summary: </span>
            {challenge.analysisSummary}
          </p>
        )}
      </div>
    </AIPanel>
  );
}

export function AIAnalysisSkeleton() {
  return (
    <AIPanel title="AI is analyzing…" icon={<BrainCircuit className="size-3.5 animate-pulse" />}>
      <div className="space-y-2.5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-primary/10" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-primary/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-primary/10" />
        <p className="pt-1 text-xs text-muted-foreground">
          Breaking the problem into sub-problems…
        </p>
      </div>
    </AIPanel>
  );
}
