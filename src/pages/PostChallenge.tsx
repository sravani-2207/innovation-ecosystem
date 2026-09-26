import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AIAnalysisView, AIAnalysisSkeleton } from "@/components/AIAnalysisView";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { DIFFICULTIES, DOMAINS } from "@/lib/constants";
import { useAction, useMutation, useQuery } from "convex/react";
import { BrainCircuit, Loader2, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

type SubProblem = {
  title: string;
  description: string;
  whyItMatters: string;
  direction: string;
  skills: string[];
};

interface Analysis {
  domain: string;
  difficulty: string;
  requiredSkills: string[];
  preferredSkills: string[];
  objectives: string[];
  constraints: string[];
  evaluationCriteria: string[];
  subProblems: SubProblem[];
  summary: string;
}

export default function PostChallenge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const myProfile = useQuery(api.profiles.getCurrentProfile, {});

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [context, setContext] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [domain, setDomain] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [evaluationCriteria, setEvaluationCriteria] = useState<string[]>([
    "Innovation",
    "Feasibility",
    "Social Impact",
    "Scalability",
    "Technical Implementation",
  ]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [createdId, setCreatedId] = useState<Id<"challenges"> | null>(null);

  const createChallenge = useMutation(api.challenges.create);
  const saveAnalysis = useMutation(api.challenges.saveAnalysis);
  const analyze = useAction(api.aiPublic.analyzeChallenge);

  // guard: orgs only
  const isOrg = user?.role === "organization";

  useEffect(() => {
    if (myProfile === null) navigate("/onboarding", { replace: true });
  }, [myProfile, navigate]);

  const canAnalyze = title.trim().length > 4 && problemStatement.trim().length > 20;
  const canPublish = canAnalyze && domain && difficulty && requiredSkills.length > 0;

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const raw = await analyze({
        title: title.trim(),
        problemStatement: problemStatement.trim(),
        context: context.trim() || undefined,
      });
      const a = raw as unknown as Analysis;
      setAnalysis(a);
      setDomain(a.domain);
      setDifficulty(a.difficulty);
      setRequiredSkills(a.requiredSkills);
      setPreferredSkills(a.preferredSkills);
      setObjectives(a.objectives);
      setConstraints(a.constraints);
      setEvaluationCriteria(
        a.evaluationCriteria.length > 0
          ? a.evaluationCriteria
          : evaluationCriteria,
      );
      toast.success("AI analysis ready — review and edit below.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing your challenge. Please try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!canPublish) {
      toast.error("Fill in the details and run the AI analysis first.");
      return;
    }
    setPublishing(true);
    try {
      const id = await createChallenge({
        input: {
          title: title.trim(),
          problemStatement: problemStatement.trim(),
          context: context.trim() || undefined,
          objectives: objectives.length > 0 ? objectives : ["Solve the stated problem"],
          expectedOutcome: expectedOutcome.trim() || undefined,
          constraints,
          domain,
          difficulty,
          requiredSkills,
          preferredSkills,
          location: undefined,
          availability: undefined,
          deadline: undefined,
          evaluationCriteria,
        },
        publish: true,
      });
      if (analysis && analysis.subProblems.length > 0) {
        await saveAnalysis({
          id,
          subProblems: analysis.subProblems,
          analysisSummary: analysis.summary,
        });
      }
      toast.success("Challenge published!", {
        description: "Students can now discover and join it.",
      });
      setCreatedId(id);
      navigate(`/challenges/${id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not publish the challenge.",
      );
    } finally {
      setPublishing(false);
    }
  };

  if (!isOrg) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Organizations only</CardTitle>
            <CardDescription>
              Sign in with an organization account to publish challenges.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Publish a challenge
        </h1>
        <p className="mt-1.5 text-muted-foreground">
          Write the problem the way you'd explain it to a colleague. The
          analyzer turns it into structure — sub-problems, skills, criteria —
          and you stay in control of every field before it goes live.
        </p>
      </header>

      <div className="space-y-6">
        <Card className="soft-shadow border-border/80">
          <CardHeader>
            <CardTitle className="text-base">The problem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Reduce Food Waste in University Cafeterias"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Problem statement</Label>
              <Textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                rows={5}
                placeholder="Describe the real-world problem: who it affects, what goes wrong today, and why it persists…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Context (optional)</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                placeholder="Scale, users, existing systems, data available…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expected outcome (optional)</Label>
              <Input
                value={expectedOutcome}
                onChange={(e) => setExpectedOutcome(e.target.value)}
                placeholder="e.g. A working MVP reducing waste by 20% in one semester"
              />
            </div>
            <Button
              type="button"
              className="gap-2"
              onClick={runAnalysis}
              disabled={!canAnalyze || analyzing}
            >
              {analyzing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  udbhava is analyzing…
                </>
              ) : (
                <>
                  <BrainCircuit className="size-4" />
                  Analyze with AI
                </>
              )}
            </Button>
            {analyzing && (
              <div className="mt-2">
                <AIAnalysisSkeleton />
              </div>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <AIAnalysisView
            challenge={
              {
                subProblems: analysis.subProblems,
                analysisSummary: analysis.summary,
              } as never
            }
          />
        )}

        <Card className="soft-shadow border-border/80">
          <CardHeader>
            <CardTitle className="text-base">
              Structured details {analysis && "(AI pre-filled — edit freely)"}
            </CardTitle>
            <CardDescription>
              These fields power student discovery and the match-score engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Domain</Label>
                <Select value={domain} onValueChange={setDomain}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <TagEditor
              label="Required skills"
              values={requiredSkills}
              onChange={setRequiredSkills}
              placeholder="e.g. Machine Learning"
            />
            <TagEditor
              label="Preferred skills"
              values={preferredSkills}
              onChange={setPreferredSkills}
              placeholder="e.g. GIS"
            />
            <TagEditor
              label="Objectives"
              values={objectives}
              onChange={setObjectives}
              placeholder="Add an objective…"
            />
            <TagEditor
              label="Constraints"
              values={constraints}
              onChange={setConstraints}
              placeholder="Add a constraint…"
            />
            <TagEditor
              label="Evaluation criteria"
              values={evaluationCriteria}
              onChange={setEvaluationCriteria}
              placeholder="Add a criterion…"
            />
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard")} disabled={publishing}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={!canPublish || publishing}>
            {publishing && <Loader2 className="mr-2 size-4 animate-spin" />}
            Publish Challenge
          </Button>
        </div>
      </div>
      {createdId && (
        <p className="mt-3 text-right text-xs text-muted-foreground">
          Published as {createdId}
        </p>
      )}
    </main>
  );
}

/** Simple editable tag list (Enter or Add to append, X to remove). */
function TagEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="h-9 bg-card"
        />
        <Button type="button" variant="outline" size="sm" className="h-9 shrink-0" onClick={add}>
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium"
            >
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Silence unused import warning for Trash2 (kept for future edit flows).
void Trash2;
