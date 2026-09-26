import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SKILLS, INTERESTS } from "@/lib/constants";
import { Check, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";

/** Multi-select picker over a fixed taxonomy (skills / interests). */
export function TaxonomyPicker({
  options,
  selected,
  onChange,
  placeholder = "Add…",
  max = 12,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => !selected.includes(o))
      .filter((o) => (q ? o.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [options, selected, query]);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  const addCustom = () => {
    const value = query.trim();
    if (!value || selected.includes(value) || selected.length >= max) return;
    onChange([...selected, value]);
    setQuery("");
  };

  return (
    <div className="space-y-2.5">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="gap-1 bg-secondary pr-1.5 font-medium"
            >
              {s}
              <button
                type="button"
                aria-label={`Remove ${s}`}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                onClick={() => toggle(s)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions.length > 0) toggle(suggestions[0]);
              else addCustom();
            }
          }}
          placeholder={placeholder}
          className="h-9 bg-card"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0"
          onClick={addCustom}
          disabled={!query.trim()}
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Plus className="size-3" />
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const SKILL_OPTIONS = SKILLS;
export const INTEREST_OPTIONS = INTERESTS;

/** Inline checklist row used in onboarding previews. */
export function PickerChecklist({
  items,
  done,
}: {
  items: readonly string[];
  done: number;
}) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-2">
          <span
            className={`flex size-4 items-center justify-center rounded-full ${
              i < done
                ? "bg-success/15 text-success"
                : "border border-border text-muted-foreground/40"
            }`}
          >
            {i < done && <Check className="size-2.5" />}
          </span>
          <span className={i < done ? "text-foreground" : "text-muted-foreground"}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
