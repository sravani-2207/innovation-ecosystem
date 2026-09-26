import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChallengeCard } from "@/components/ChallengeCard";
import { EmptyState, LoadingGrid, NoResults } from "@/components/states";
import { PublicNav, PublicFooter } from "@/components/PublicChrome";
import { AIPanel } from "@/components/AIPanel";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import {
  DIFFICULTIES,
  DOMAINS,
} from "@/lib/constants";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";

/**
 * One-time demo seed. Because this deployment is for our own team, the sample
 * problems are only generated while nobody has signed in yet — so real
 * members never receive invented content.
 */
function DemoSeed() {
  const { isAuthenticated } = useAuth();
  const seeded = useQuery(api.meta.isSeeded, isAuthenticated ? "skip" : {});
  const seed = useMutation(api.meta.seedDemo);
  useEffect(() => {
    if (isAuthenticated || seeded !== false) return;
    seed().catch(() => {
      // Seeding is best-effort; the catalog works fine without it.
    });
  }, [isAuthenticated, seeded, seed]);
  return null;
}

export default function Challenges() {
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();
  const challenges = useChallenges();
  const recommended = useRecommended();

  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  // Auto-open the AI panel once recommendations exist (derived, no effect).
  const [userToggledRecs, setUserToggledRecs] = useState(false);
  const hasRecs = recommended.length > 0;
  const showRecommended = hasRecs && !userToggledRecs;

  const student = user?.role === "student" || role === "student";
  const loading = challenges === undefined;

  const filtered = useMemo(() => {
    if (!challenges) return [];
    const q = query.trim().toLowerCase();
    return challenges.filter((c) => {
      if (domain !== "all" && c.domain !== domain) return false;
      if (difficulty !== "all" && c.difficulty !== difficulty) return false;
      if (status !== "all" && c.status !== status) return false;
      if (q) {
        const hay = `${c.title} ${c.problemStatement} ${c.orgName} ${c.requiredSkills.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [challenges, query, domain, difficulty, status]);

  return (
    <div className="flex min-h-screen flex-col">
      <DemoSeed />
      <PublicNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Catalog
            </h1>
            <p className="mt-1.5 text-muted-foreground">
              Every problem published inside the workspace — open challenges
              carry your personal match score.
            </p>
          </div>
          {isAuthenticated && (role === "organization" || user?.role === "organization") && (
            <Button onClick={() => navigate("/post-challenge")}>
              Publish a challenge
            </Button>
          )}
        </div>

        {/* Recommended for you (students only) */}
        {student && !loading && recommended.length > 0 && (
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setUserToggledRecs((v) => !v)}
              className="mb-3 flex w-full items-center justify-between rounded-xl border border-primary/25 bg-accent/70 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
                <Sparkles className="size-4 text-primary" />
                {showRecommended ? "Hide" : "Show"} challenges picked for you
              </span>
              <Badge variant="secondary" className="bg-primary/15 text-primary">
                {recommended.length} match{recommended.length === 1 ? "" : "es"}
              </Badge>
            </button>
            {showRecommended && (
              <AIPanel title="Picked for you" className="mb-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommended.slice(0, 3).map(({ challenge, match }) => (
                    <ChallengeCard key={challenge._id} challenge={challenge} match={match} />
                  ))}
                </div>
              </AIPanel>
            )}
          </div>
        )}

        {/* Search + filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search challenges, skills, organizations…"
              className="border-0 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect value={domain} onChange={setDomain} placeholder="All domains" options={[...DOMAINS]} />
            <FilterSelect value={difficulty} onChange={setDifficulty} placeholder="All levels" options={[...DIFFICULTIES]} />
            <FilterSelect
              value={status}
              onChange={setStatus}
              placeholder="Any status"
              options={["open_for_participation", "team_formation", "development", "submission_open", "evaluation"]}
              labelMap={{
                open_for_participation: "Open for participation",
                team_formation: "Team formation",
                development: "Development",
                submission_open: "Submission open",
                evaluation: "Evaluation",
              }}
            />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingGrid />
        ) : filtered.length === 0 ? (
          query || domain !== "all" || difficulty !== "all" || status !== "all" ? (
            <NoResults
              query={query || "current filters"}
              onClear={() => {
                setQuery("");
                setDomain("all");
                setDifficulty("all");
                setStatus("all");
              }}
            />
          ) : (
            <EmptyState
              title="The catalog is empty"
              description="No challenges have been published yet. Once one goes live it will appear here with your match score."
              actionLabel={isAuthenticated ? "Complete your profile" : "Create account"}
              actionTo={isAuthenticated ? "/profile" : "/auth?mode=register"}
            />
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <ChallengeCard key={c._id} challenge={c} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {filtered.length} challenge{filtered.length === 1 ? "" : "s"}
          </p>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  labelMap,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
  labelMap?: Record<string, string>;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full bg-secondary/60 sm:w-[160px]">
        <SlidersHorizontal className="size-3.5 text-muted-foreground" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {labelMap?.[o] ?? o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Small hooks so the component body stays readable.
function useChallenges(): Doc<"challenges">[] | undefined {
  return useQuery(api.challenges.listPublic, {});
}

function useRecommended() {
  const data = useQuery(api.challenges.listRecommended, {});
  return data ?? [];
}
