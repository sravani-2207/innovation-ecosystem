import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TagEditor } from "@/components/TagEditor";
import { AIAnalysisLoading, AIAnalysisResult } from "@/components/AIIdeaAnalysis";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { SKILLS } from "@/lib/constants";
import { generateMockAnalysis, type IdeaAnalysis } from "@/lib/mockAnalysis";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  FileUp,
  Loader2,
  Paperclip,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type Stage = "form" | "analyzing" | "done";

export default function SubmitIdea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const challengeId = id as Id<"challenges">;

  const challenge = useQuery(api.challenges.getPublic, { id: challengeId });
  const myProfile = useQuery(api.profiles.getCurrentProfile, {});
  const existing = useQuery(api.ideas.getMineForChallenge, { challengeId });

  const createIdea = useMutation(api.ideas.create);
  const saveAnalysis = useMutation(api.ideas.saveAnalysis);

  const [stage, setStage] = useState<Stage>("form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [file, setFile] = useState<{ name: string; type: string } | null>(null);
  const [analysis, setAnalysis] = useState<IdeaAnalysis | null>(null);
  const [ideaId, setIdeaId] = useState<Id<"ideas"> | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Prefill from an existing submission if present.
  if (existing && stage === "form" && !title) {
    setTitle(existing.title);
    setDescription(existing.description);
    setTechnologies(existing.technologies);
  }

  const canAnalyze =
    title.trim().length > 3 &&
    description.trim().length > 30 &&
    technologies.length > 0;

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Please attach a file under 5 MB for the prototype.");
      return;
    }
    setFile({ name: f.name, type: f.type || "file" });
    toast.success(`Attached “${f.name}”.`);
  };

  const analyze = async () => {
    if (!canAnalyze) {
      toast.error(
        "Add a title, a description of at least a few sentences, and at least one technology.",
      );
      return;
    }
    setSaving(true);
    setStage("analyzing");
    try {
      // Persist the idea first (idempotent-feeling: reuse existing idea).
      let id = ideaId;
      if (!id && existing) {
        id = existing._id;
      }
      if (!id) {
        id = await createIdea({
          challengeId,
          title: title.trim(),
          description: description.trim(),
          technologies,
          fileName: file?.name,
          fileType: file?.type,
        });
        setIdeaId(id);
      }

      const result = await generateMockAnalysis({
        ideaTitle: title.trim(),
        ideaDescription: description.trim(),
        technologies,
        challengeTitle: challenge?.title ?? "the challenge",
        problemStatement: challenge?.problemStatement ?? "",
        domain: challenge?.domain ?? "social impact",
        requiredSkills: challenge?.requiredSkills ?? [],
      });

      await saveAnalysis({ ideaId: id, analysis: result });
      setAnalysis(result);
      setStage("done");
      toast.success("Analysis ready.");
    } catch (err) {
      setStage("form");
      toast.error(
        err instanceof Error ? err.message : "Could not analyze the idea.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (challenge === undefined || myProfile === undefined || myProfile === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    );
  }

  if (challenge === null) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            This challenge is no longer available.
          </CardContent>
        </Card>
      </main>
    );
  }

  const profile = myProfile.profile;
  if (!profile || profile.role !== "student") {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Ideas can only be submitted by students who joined the challenge.
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-4 gap-1.5 text-muted-foreground"
        onClick={() => navigate(`/challenges/${challengeId}`)}
      >
        <ArrowLeft className="size-4" />
        Back to challenge
      </Button>

      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Idea submission
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
          {existing ? "Your idea" : "Submit your idea"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          For{" "}
          <Link
            to={`/challenges/${challengeId}`}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {challenge.title}
          </Link>
          {" · "}
          {user?.name}
        </p>
      </header>

      {stage === "analyzing" ? (
        <AIAnalysisLoading />
      ) : (
        <div className="space-y-6">
          <Card className="soft-shadow border-border/80">
            <CardHeader>
              <CardTitle className="text-base">The idea</CardTitle>
              <CardDescription>
                Be concrete — the analysis is only as good as what you share.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Idea title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SmartFood — canteen demand prediction"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Idea / solution description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe what you will build, who will use it, what data it needs, and how it solves the stated problem…"
                />
              </div>
              <TagEditor
                label="Technologies / skills"
                values={technologies}
                onChange={setTechnologies}
                placeholder="Type a technology and press Enter…"
              />
              <div className="space-y-1.5">
                <Label>Sample file or image (optional)</Label>
                {file ? (
                  <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <button
                      type="button"
                      aria-label="Remove attachment"
                      className="rounded-md p-1 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                      onClick={() => setFile(null)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <FileUp className="size-5" />
                    Click to attach a sketch, dataset sample or document (max 5 MB)
                  </button>
                )}
                <input
                  ref={fileInput}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.ppt,.pptx,.txt"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </CardContent>
          </Card>

          {analysis && stage === "done" && <AIAnalysisResult analysis={analysis} />}

          {/* Already-analyzed existing idea loaded from the DB */}
          {stage === "form" && existing?.analysis && !analysis && (
            <AIAnalysisResult
              analysis={{
                problemUnderstanding: existing.analysis.problemUnderstanding,
                strengths: existing.analysis.strengths,
                missing: existing.analysis.missing,
                suggestions: existing.analysis.suggestions,
                expectedImpact: existing.analysis.expectedImpact,
              }}
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            {existing?.analysis && (
              <Badge
                variant="outline"
                className="border-success/30 bg-success/10 text-success"
              >
                <CheckCircle2 className="mr-1 size-3" />
                Analyzed {new Date(existing.analysis.analyzedAt).toLocaleDateString()}
              </Badge>
            )}
            <Button
              size="lg"
              className="ml-auto gap-2"
              onClick={analyze}
              disabled={!canAnalyze || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <BrainCircuit className="size-4" />
                  {analysis || existing?.analysis ? "Re-analyze with AI" : "Analyze with AI"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
