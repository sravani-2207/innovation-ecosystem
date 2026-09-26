import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

/**
 * Visual identity for all Udbhava AI features: soft light-orange container,
 sparkle icon and small-caps label. Content varies per feature.
 */
export function AIPanel({
  title,
  icon,
  children,
  className,
  compact,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-primary/20 bg-accent/70 ai-glow",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <header className="mb-3 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
          {icon ?? <Sparkles className="size-3.5" />}
        </span>
        <h3 className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}
