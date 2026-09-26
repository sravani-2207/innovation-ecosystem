import { cn } from "@/lib/utils";
import { Check, CircleDashed } from "lucide-react";

/**
 * Udbhava AI match score: big number, skill checklist showing what matched
 * and what is missing. Rendered on challenge cards and detail pages.
 */
export function MatchScore({
  score,
  matched,
  missing,
  notes,
  size = "sm",
  className,
}: {
  score: number;
  matched: string[];
  missing: string[];
  notes?: string[];
  size?: "sm" | "lg";
  className?: string;
}) {
  const strong = score >= 80;
  const medium = score >= 60;
  const tone = strong
    ? "text-success"
    : medium
      ? "text-primary"
      : "text-muted-foreground";
  const ring = strong
    ? "border-success/40 bg-success/10"
    : medium
      ? "border-primary/30 bg-accent"
      : "border-border bg-muted";

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-2",
          ring,
          size === "lg" && "px-5 py-3.5",
        )}
      >
        <span className={cn("text-xl leading-none font-bold tabular-nums", tone, size === "lg" && "text-3xl")}>
          {score}
          <span className="text-[0.6em]">%</span>
        </span>
        <span className="mt-1 text-[9px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          match
        </span>
      </div>
      {size === "lg" && (
        <div className="min-w-0 space-y-1.5 text-sm">
          {matched.slice(0, 3).map((s) => (
            <div key={s} className="flex items-center gap-1.5 text-success">
              <Check className="size-3.5 shrink-0" />
              {s}
            </div>
          ))}
          {missing.slice(0, 2).map((s) => (
            <div
              key={s}
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <CircleDashed className="size-3.5 shrink-0" />
              {s} <span className="text-xs">(to learn on the way)</span>
            </div>
          ))}
          {notes && notes.length > 0 && (
            <div className="pt-0.5 text-xs text-muted-foreground italic">
              {notes.join(" · ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
