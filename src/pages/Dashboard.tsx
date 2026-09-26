import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengeCard } from "@/components/ChallengeCard";
import { AIPanel } from "@/components/AIPanel";
import { ChallengeStatus, DifficultyBadge } from "@/components/badges";
import { EmptyState } from "@/components/states";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  Building2,
  Compass,
  Plus,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { SkillBadge } from "@/components/badges";

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10">
      {role === "organization" ? <OrgDashboard /> : <StudentDashboard name={user?.name} />}
    </main>
  );
}

/* ------------------------------ Student ------------------------------ */

function StudentDashboard({ name }: { name?: string }) {
  const navigate = useNavigate();
  const recommended = useQuery(api.challenges.listRecommended, {});
  const joined = useQuery(api.challenges.listJoinedWithMatch, {});
  const peers = useQuery(api.challenges.listPeers, {});
  const challenges = useQuery(api.challenges.listPublic, {});

  const loading =
    recommended === undefined || joined === undefined || peers === undefined;

  const topRecs = (recommended ?? []).slice(0, 3);
  const joinedCount = joined?.length ?? 0;
  const avgMatch =
    joined && joined.length > 0
      ? Math.round(joined.reduce((s, j) => s + j.match.score, 0) / joined.length)
      : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Student dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome{getDisplay(name, "innovator")}
          </h1>
        </div>
        <Button onClick={() => navigate("/challenges")}>
          <Compass className="mr-2 size-4" />
          Discover Challenges
        </Button>
      </header>

      {/* AI recommendations */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          <Sparkles className="size-4 text-primary" />
          AI recommendations
        </h2>
        {loading ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Loading your matches…
            </CardContent>
          </Card>
        ) : topRecs.length === 0 ? (
          <AIPanel title="AI recommendations">
            <p className="text-sm text-muted-foreground">
              {joinedCount > 0
                ? "You're all caught up — every matching challenge is already joined."
                : "Join your first challenge and Udbhava AI will personalize every recommendation after that."}
            </p>
          </AIPanel>
        ) : (
          <AIPanel title={`Recommended for you · ${topRecs.length} strong matches`}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topRecs.map(({ challenge, match }) => (
                <ChallengeCard key={challenge._id} challenge={challenge} match={match} />
              ))}
            </div>
          </AIPanel>
        )}
      </section>

      {/* Active challenges */}
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          My active challenges
        </h2>
        {joined === undefined ? (
          <LoadingCards />
        ) : joined.length === 0 ? (
          <EmptyState
            title="No challenges joined yet"
            description="Discover a challenge that matches your skills and join to unlock team formation and AI mentoring."
            actionLabel="Explore Challenges"
            actionTo="/challenges"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joined.map(({ challenge, match }) => (
              <ChallengeCard key={challenge._id} challenge={challenge} match={match} />
            ))}
          </div>
        )}
      </section>

      {/* Progress strip */}
      {!loading && joinedCount > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
            Your innovation journey
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Challenges joined" value={String(joinedCount)} />
            <StatCard label="Average AI match" value={`${avgMatch}%`} />
            <StatCard label="Open challenges" value={String(challenges?.length ?? 0)} />
          </div>
        </section>
      )}

      {/* Peer innovators */}
      <section>
        <h2 className="mb-3 text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          Innovators on Udbhava
        </h2>
        {peers === undefined ? (
          <LoadingCards />
        ) : peers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You're one of the first students here — invite your classmates to
            build teams together.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {peers.slice(0, 6).map((p) => (
              <Card key={p.userId} className="border-border/80">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
                      {p.name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-sm">{p.name}</CardTitle>
                      <CardDescription className="truncate text-xs">
                        {p.college ?? "Student innovator"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-1.5">
                  {p.skills.slice(0, 3).map((s) => (
                    <SkillBadge key={s} skill={s} />
                  ))}
                  {p.skills.length > 3 && (
                    <SkillBadge skill={`+${p.skills.length - 3}`} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------------------------- Organization ---------------------------- */

function OrgDashboard() {
  const navigate = useNavigate();
  const mine = useQuery(api.challenges.listMine, {});

  const loading = mine === undefined;
  const active = (mine ?? []).filter(
    (c) => c.status !== "draft" && c.status !== "archived",
  );
  const drafts = (mine ?? []).filter((c) => c.status === "draft");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="size-4" /> Organization dashboard
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Your challenges
          </h1>
        </div>
        <Button onClick={() => navigate("/post-challenge")}>
          <Plus className="mr-2 size-4" />
          Post a Challenge
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active challenges" value={String(active.length)} />
        <StatCard
          label="Total participants"
          value={String(
            (mine ?? []).reduce((s, c) => s + c.participantsCount, 0),
          )}
        />
        <StatCard label="Drafts" value={String(drafts.length)} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold tracking-[0.08em] text-muted-foreground uppercase">
          My challenges
        </h2>
        {loading ? (
          <LoadingCards />
        ) : (mine ?? []).length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" />}
            title="No challenges yet"
            description="Publish your first real-world problem — Udbhava AI will structure it and match it to student innovators."
            actionLabel="Post a Challenge"
            actionTo="/post-challenge"
          />
        ) : (
          <div className="space-y-3">
            {(mine ?? []).map((c) => (
              <Card key={c._id} className="soft-shadow border-border/80">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <ChallengeStatus status={c.status} />
                      <DifficultyBadge level={c.difficulty} />
                    </div>
                    <Link
                      to={`/challenges/${c._id}`}
                      className="block truncate font-semibold hover:text-primary"
                    >
                      {c.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {c.participantsCount} participants · {c.requiredSkills.slice(0, 3).join(", ")}
                      {c.requiredSkills.length > 3 ? "…" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/80">
      <CardContent className="p-5">
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function LoadingCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-muted/50" />
      ))}
    </div>
  );
}

function getDisplay(name: string | undefined, fallback: string) {
  const first = name?.split(" ")[0];
  return first ? `, ${first}` : `, ${fallback}`;
}
