import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, X } from "lucide-react";

/** Lifecycle status chip for challenges. */
export function ChallengeStatus({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const styles: Record<string, string> = {
    draft: "bg-muted text-muted-foreground border-border",
    published: "bg-secondary text-secondary-foreground border-border",
    open_for_participation:
      "bg-primary/10 text-primary border-primary/25",
    team_formation: "bg-warning/10 text-warning border-warning/30",
    development: "bg-secondary text-secondary-foreground border-border",
    submission_open: "bg-accent text-accent-foreground border-primary/20",
    evaluation: "bg-warning/10 text-warning border-warning/30",
    improvement: "bg-accent text-accent-foreground border-primary/20",
    completed: "bg-success/10 text-success border-success/30",
    showcased: "bg-success/15 text-success border-success/40",
    archived: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        styles[status] ?? styles.draft,
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-success/10 text-success border-success/25",
  Intermediate: "bg-warning/10 text-warning border-warning/25",
  Advanced: "bg-destructive/10 text-destructive border-destructive/25",
};

export function DifficultyBadge({ level }: { level: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", LEVEL_STYLES[level] ?? LEVEL_STYLES.Intermediate)}
    >
      {level}
    </Badge>
  );
}

export function SkillBadge({ skill }: { skill: string }) {
  return (
    <Badge
      variant="outline"
      className="border-border bg-muted/60 font-normal text-muted-foreground"
    >
      {skill}
    </Badge>
  );
}

/** Verdict-style label used in structured feedback (v2 evaluations). */
export function VerdictBadge({ verdict }: { verdict: string }) {
  const map: Record<string, { icon: typeof Check; cls: string }> = {
    strong: { icon: Check, cls: "text-success" },
    moderate: { icon: AlertTriangle, cls: "text-warning" },
    weak: { icon: X, cls: "text-destructive" },
  };
  const { icon: Icon, cls } = map[verdict.toLowerCase()] ?? map.moderate;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", cls)}>
      <Icon className="size-3.5" />
      {verdict}
    </span>
  );
}
