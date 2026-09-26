import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChallengeStatus, DifficultyBadge, SkillBadge } from "@/components/badges";
import { MatchScore } from "@/components/MatchScore";
import { STATUS_LABELS } from "@/lib/constants";
import { Building2, Users, CalendarDays } from "lucide-react";
import { Link } from "react-router";
import type { Doc } from "@/convex/_generated/dataModel";

type Challenge = Doc<"challenges">;
type Match = { score: number; matched: string[]; missing: string[]; notes: string[] };

function formatDate(ts?: number) {
  if (!ts) return null;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ChallengeCard({
  challenge,
  match,
  joined,
}: {
  challenge: Challenge;
  match?: Match;
  joined?: boolean;
}) {
  const deadline = formatDate(challenge.deadline);
  return (
    <Link
      to={`/challenges/${challenge._id}`}
      className="group block h-full rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Card className="soft-shadow h-full gap-3 border-border/80 bg-card py-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40">
        <CardHeader className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {joined ? (
              <Badge
                variant="outline"
                className="border-success/30 bg-success/10 font-medium text-success"
              >
                Joined
              </Badge>
            ) : (
              <ChallengeStatus status={challenge.status} />
            )}
            <DifficultyBadge level={challenge.difficulty} />
          </div>
          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-foreground group-hover:text-primary">
            {challenge.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="size-3.5" />
            {challenge.orgName}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {match ? (
            <MatchScore
              score={match.score}
              matched={match.matched}
              missing={match.missing}
              notes={match.notes}
            />
          ) : (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {challenge.problemStatement}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {challenge.requiredSkills.slice(0, 4).map((s) => (
              <SkillBadge key={s} skill={s} />
            ))}
            {challenge.requiredSkills.length > 4 && (
              <Badge variant="outline" className="border-border bg-muted/60 font-normal text-muted-foreground">
                +{challenge.requiredSkills.length - 4}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {challenge.participantsCount} participant
            {challenge.participantsCount === 1 ? "" : "s"}
          </span>
          {deadline && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {deadline}
            </span>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ChallengeCardSkeleton() {
  return (
    <Card className="h-full gap-3 py-5">
      <CardHeader className="space-y-2.5">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3.5 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export { STATUS_LABELS };
