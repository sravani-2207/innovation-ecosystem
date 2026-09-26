import { Button } from "@/components/ui/button";
import { Search, Compass, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

/** Meaningful empty states — every list gets one. */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && (actionTo || onAction) && (
        <Button
          className="mt-5"
          onClick={() => (actionTo ? navigate(actionTo) : onAction?.())}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-52 animate-pulse rounded-xl border border-border bg-muted/50"
        />
      ))}
    </div>
  );
}

export function NoResults({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <Search className="mb-3 size-6 text-muted-foreground" />
      <h3 className="text-base font-semibold">No results for “{query}”</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try different keywords or clear the filters.
      </p>
      <Button variant="outline" className="mt-4" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

export function DiscoverMore() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Compass className="size-4" />
      Discover more challenges each week.
    </div>
  );
}
