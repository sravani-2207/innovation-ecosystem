import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState } from "@/components/states";
import { AIAnalysisResult } from "@/components/AIIdeaAnalysis";
import { SkillBadge } from "@/components/badges";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  BrainCircuit,
  ExternalLink,
  FileText,
  GraduationCap,
  Lightbulb,
  MapPin,
  Paperclip,
} from "lucide-react";
import { Link } from "react-router";

export default function OrgIdeas() {
  const { isAuthenticated } = useAuth();
  const rows = useQuery(api.ideas.listForOrg, isAuthenticated ? {} : "skip");
  const loading = rows === undefined;
  const fileUrl = useQuery(
    api.files.getFileUrl,
    // Pre-fetch the first attachment URL for quick preview (prototype scope:
    // one attachment per idea).
    rows && rows[0]?.idea.fileStorageId
      ? { storageId: rows[0].idea.fileStorageId }
      : "skip",
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10">
      <header className="mb-8">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lightbulb className="size-4" /> Organization workspace
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Review Ideas
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ideas submitted against your challenges, with the AI analysis and the
          student's details side by side.
        </p>
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-muted/50" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="size-5" />}
          title="No ideas yet"
          description="When students submit ideas against your published challenges, they appear here with their analysis and profile."
          actionLabel="Publish a challenge"
          actionTo="/post-challenge"
        />
      ) : (
        <div className="space-y-6">
          {rows.map(({ idea, challenge, student }) => (
            <Card key={idea._id} className="soft-shadow border-border/80">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-primary/25 bg-accent text-accent-foreground"
                      >
                        <BrainCircuit className="mr-1 size-3" />
                        {idea.analysis ? "Analyzed" : "Awaiting analysis"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-border bg-muted/60 font-normal text-muted-foreground"
                      >
                        {challenge.domain}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-snug">
                      {idea.title}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      for{" "}
                      <Link
                        to={`/challenges/${challenge._id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {challenge.title}
                      </Link>{" "}
                      · submitted{" "}
                      {new Date(idea._creationTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line text-sm leading-6 text-foreground">
                  {idea.description}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {idea.technologies.map((t) => (
                    <SkillBadge key={t} skill={t} />
                  ))}
                </div>

                {idea.fileName && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{idea.fileName}</span>
                    </span>
                    {idea.fileStorageId ? (
                      <a
                        href={fileUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open attachment
                        <ExternalLink className="size-3" />
                      </a>
                    ) : (
                      <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Student details */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="student" className="border-border/60">
                    <AccordionTrigger className="py-2.5 text-sm font-medium hover:no-underline">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="size-4 text-primary" />
                        Student details — {student.name}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-1">
                      <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                        <Detail label="Email" value={student.email} />
                        <Detail label="College" value={student.college ?? "—"} />
                        <Detail
                          label="Course / Year"
                          value={
                            [student.course, student.year].filter(Boolean).join(" · ") || "—"
                          }
                        />
                        <Detail
                          label="Location"
                          value={student.location ?? "—"}
                          icon={<MapPin className="size-3.5" />}
                        />
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {student.skills.length > 0 ? (
                            student.skills.map((s) => <SkillBadge key={s} skill={s} />)
                          ) : (
                            <span className="text-sm text-muted-foreground">Not listed</span>
                          )}
                        </div>
                      </div>
                      {student.interests.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Interests
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {student.interests.map((s) => (
                              <SkillBadge key={s} skill={s} />
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* AI analysis (from the prototype's mock analyzer) */}
                {idea.analysis && (
                  <AIAnalysisResult
                    compact
                    analysis={{
                      problemUnderstanding: idea.analysis.problemUnderstanding,
                      strengths: idea.analysis.strengths,
                      missing: idea.analysis.missing,
                      suggestions: idea.analysis.suggestions,
                      expectedImpact: idea.analysis.expectedImpact,
                    }}
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function Detail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
