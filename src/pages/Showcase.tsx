import { Card, CardContent } from "@/components/ui/card";
import { PublicNav, PublicFooter } from "@/components/PublicChrome";
import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Rocket, Sparkles } from "lucide-react";

const HIGHLIGHTS = [
  {
    title: "SmartFood AI — demand prediction for campus kitchens",
    problem: "Daily meal demand was guesswork; leftovers piled up.",
    outcome: "Pilot cut over-preparation and surfaced popularity patterns.",
    domain: "Food Systems",
  },
  {
    title: "Borewell watch — low-cost water quality telemetry",
    problem: "Contamination surfaced only after people fell ill.",
    outcome: "Alerting sensor kit designed for offline villages.",
    domain: "Water & Sanitation",
  },
  {
    title: "Early screening assistant for primary teachers",
    problem: "Yearly paper checklists delayed intervention.",
    outcome: "Offline-first screening flows for shared tablets.",
    domain: "Education",
  },
];

export default function Showcase() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent/80 px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="size-3.5" />
            Public Innovation Showcase
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Solutions that made the journey
          </h1>
          <p className="mt-1.5 max-w-2xl text-muted-foreground">
            When an organization approves a completed project, it is published
            here so future innovators can learn from it. Version 1 collects the
            first success stories — the full showcase pipeline (evaluation →
            approval → publish) arrives in v2.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <Card key={h.title} className="soft-shadow border-border/80">
              <CardContent className="space-y-3 p-5">
                <Badge variant="outline" className="border-primary/25 bg-accent text-accent-foreground">
                  {h.domain}
                </Badge>
                <h3 className="leading-snug font-semibold">{h.title}</h3>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Problem: </span>
                    {h.problem}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Outcome: </span>
                    {h.outcome}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <EmptyState
            icon={<Rocket className="size-5" />}
            title="Full showcase arriving in v2"
            description="Once teams complete projects and organizations approve them for public visibility, every approved solution will appear here with problem, approach, team and impact."
            actionLabel="Explore open challenges"
            actionTo="/challenges"
          />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
