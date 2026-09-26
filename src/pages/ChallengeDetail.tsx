import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeStatus, DifficultyBadge, SkillBadge } from "@/components/badges";
import { AIAnalysisView } from "@/components/AIAnalysisView";
import { JoinChallengeButton } from "@/components/JoinChallengeButton";
import { MatchScore } from "@/components/MatchScore";
import { PublicNav, PublicFooter } from "@/components/PublicChrome";
import { EmptyState } from "@/components/states";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Target,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const challenge = useQuery(
    api.challenges.getPublic,
    id ? { id: id as never } : "skip",
  );
  const joined = useQuery(
    api.challenges.hasJoined,
    id ? { id: id as never } : "skip",
  );
  const myProfile = useQuery(api.profiles.getCurrentProfile, {});
  const participants = useQuery(
    api.challenges.listParticipants,
    id ? { id: id as never } : "skip",
  );

  if (challenge === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicNav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-4 h-4 w-1/3" />
          <Skeleton className="mt-8 h-40 w-full" />
          <Skeleton className="mt-4 h-60 w-full" />
        </main>
      </div>
    );
  }

  if (challenge === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicNav />
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
          <EmptyState
            title="Challenge not found"
            description="It may have been unpublished or archived. The catalog shows everything currently live."
            actionLabel="Back to the catalog"
            actionTo="/challenges"
          />
        </main>
      </div>
    );
  }

  const isStudent = role === "student" || user?.role === "student";
  const profile = myProfile?.profile;
  const canJoin =
    isStudent &&
    profile?.onboarded &&
    challenge.status === "open_for_participation";
  const reason = !isStudent
    ? "Only students can join challenges"
    : !profile?.onboarded
      ? "Complete your profile first"
      : "This challenge is not open for participation";

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 gap-1.5 text-muted-foreground"
          onClick={() => navigate("/challenges")}
        >
          <ArrowLeft className="size-4" />
          Back to the catalog
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-6">
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <ChallengeStatus status={challenge.status} />
                <DifficultyBadge level={challenge.difficulty} />
                <Badge variant="outline" className="border-border bg-muted/60 font-normal text-muted-foreground">
                  {challenge.domain}
                </Badge>
              </div>
              <h1 className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                {challenge.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  {challenge.orgName}
                </span>
                {challenge.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" />
                    {challenge.location}
                  </span>
                )}
                {challenge.deadline && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    Apply by{" "}
                    {new Date(challenge.deadline).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="size-4" />
                  {challenge.participantsCount} participant
                  {challenge.participantsCount === 1 ? "" : "s"}
                </span>
              </div>
            </header>

            <section className="space-y-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                <Target className="size-4 text-primary" />
                Problem statement
              </h2>
              <p className="leading-7 text-foreground">
                {challenge.problemStatement}
              </p>
              {challenge.context && (
                <p className="leading-7 text-muted-foreground">
                  {challenge.context}
                </p>
              )}
            </section>

            {challenge.objectives.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Objectives
                </h2>
                <ul className="space-y-1.5">
                  {challenge.objectives.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-sm leading-6">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {challenge.expectedOutcome && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Expected outcome
                </h2>
                <p className="leading-7 text-muted-foreground">
                  {challenge.expectedOutcome}
                </p>
              </section>
            )}

            {challenge.constraints.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Constraints
                </h2>
                <ul className="space-y-1.5">
                  {challenge.constraints.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm leading-6">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="space-y-2">
              <h2 className="text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                Skills
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {challenge.requiredSkills.map((s) => (
                  <Badge key={s} variant="secondary" className="bg-secondary font-medium">
                    {s}
                  </Badge>
                ))}
                {challenge.preferredSkills.map((s) => (
                  <SkillBadge key={s} skill={`${s} (preferred)`} />
                ))}
              </div>
            </section>

            {challenge.subProblems.length > 0 && (
              <AIAnalysisView challenge={challenge} />
            )}

            {participants && participants.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Recent participants
                </h2>
                <div className="flex flex-wrap gap-2">
                  {participants.slice(0, 8).map((p) => (
                    <Badge
                      key={`${p.joinedAt}`}
                      variant="outline"
                      className="border-border bg-card py-1.5 pr-3 pl-1.5 font-normal"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                        {p.name.slice(0, 1).toUpperCase()}
                      </span>
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="soft-shadow border-border/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ready to build?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isStudent && profile?.onboarded && joined !== undefined && !joined && (
                  <MatchScore
                    score={matchFor(challenge, profile)}
                    matched={matchDetail(challenge, profile).matched}
                    missing={matchDetail(challenge, profile).missing}
                    size="lg"
                  />
                )}
                {joined && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
                    <CheckCircle2 className="size-4" />
                    You joined this challenge
                  </div>
                )}
                <JoinChallengeButton
                  challengeId={challenge._id}
                  joined={joined === true}
                  canJoin={canJoin === true}
                  reason={reason}
                />
                {joined && (
                  <Button variant="secondary" className="w-full" disabled>
                    Team formation — coming in v2
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardContent className="p-4 text-sm leading-6 text-muted-foreground">
                <span className="font-medium text-foreground">Availability: </span>
                {challenge.availability ?? "Flexible — agreed within the team"}
                <br />
                <span className="font-medium text-foreground">Evaluation: </span>
                {challenge.evaluationCriteria.length > 0
                  ? challenge.evaluationCriteria.join(", ")
                  : "Structured criteria defined by the organization"}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

// Local scoring re-use: the scoring module is shared with Convex.
import { scoreMatch } from "@/convex/lib/scoring";
import type { Doc } from "@/convex/_generated/dataModel";

function matchFor(challenge: Doc<"challenges">, profile: Doc<"profiles">) {
  return scoreMatch(
    {
      skills: profile.skills,
      interests: profile.interests,
      experienceLevel: profile.experienceLevel,
      location: profile.location,
      availability: profile.availability,
    },
    {
      title: challenge.title,
      problemStatement: challenge.problemStatement,
      domain: challenge.domain,
      difficulty: challenge.difficulty,
      requiredSkills: challenge.requiredSkills,
      preferredSkills: challenge.preferredSkills,
      location: challenge.location,
      availability: challenge.availability,
    },
  ).score;
}

function matchDetail(challenge: Doc<"challenges">, profile: Doc<"profiles">) {
  return scoreMatch(
    {
      skills: profile.skills,
      interests: profile.interests,
      experienceLevel: profile.experienceLevel,
      location: profile.location,
      availability: profile.availability,
    },
    {
      title: challenge.title,
      problemStatement: challenge.problemStatement,
      domain: challenge.domain,
      difficulty: challenge.difficulty,
      requiredSkills: challenge.requiredSkills,
      preferredSkills: challenge.preferredSkills,
      location: challenge.location,
      availability: challenge.availability,
    },
  );
}
