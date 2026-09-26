import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChallengeStatus } from "@/components/badges";
import { EmptyState, LoadingGrid } from "@/components/states";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Archive, LayoutList, RotateCcw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

export default function AdminChallenges() {
  const all = useQuery(api.challenges.listPublic, {});
  const setStatus = useMutation(api.admin.setChallengeStatus);

  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!all) return [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) =>
      `${c.title} ${c.orgName} ${c.domain} ${c.requiredSkills.join(" ")}`
        .toLowerCase()
        .includes(q),
    );
  }, [all, query]);

  const archive = async (id: string, title: string) => {
    setPendingId(id);
    try {
      await setStatus({ challengeId: id as never, status: "archived" });
      toast.success(`“${title}” was archived.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not archive this challenge.",
      );
    } finally {
      setPendingId(null);
    }
  };

  const reopen = async (id: string, title: string) => {
    setPendingId(id);
    try {
      await setStatus({
        challengeId: id as never,
        status: "open_for_participation",
      });
      toast.success(`“${title}” is open for participation again.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not reopen this challenge.",
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <LayoutList className="size-4" /> Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Challenges
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every published challenge in the workspace. Archiving removes it from
          the catalog without destroying the record.
        </p>
      </header>

      <div className="mb-6 rounded-xl border border-border bg-card p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, organization, domain or skill…"
            className="border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      {all === undefined ? (
        <LoadingGrid count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<LayoutList className="size-5" />}
          title="No challenges found"
          description={
            all.length === 0
              ? "Nothing has been published yet. Challenges appear here as organizations publish them."
              : "Try a different search term."
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card key={c._id} className="soft-shadow border-border/80">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <ChallengeStatus status={c.status} />
                    <Badge
                      variant="outline"
                      className="border-border bg-muted/60 font-normal text-muted-foreground"
                    >
                      {c.domain}
                    </Badge>
                    {c.aiAnalyzedAt && (
                      <Badge
                        variant="outline"
                        className="border-primary/25 bg-accent text-accent-foreground"
                      >
                        AI-structured
                      </Badge>
                    )}
                  </div>
                  <Link
                    to={`/challenges/${c._id}`}
                    className="block truncate font-semibold hover:text-primary"
                  >
                    {c.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.orgName} · {c.participantsCount} participant
                    {c.participantsCount === 1 ? "" : "s"} ·{" "}
                    {c.requiredSkills.slice(0, 3).join(", ")}
                    {c.requiredSkills.length > 3 ? "…" : ""}
                  </p>
                </div>
                {c.status === "archived" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingId === c._id}
                    onClick={() => reopen(c._id, c.title)}
                  >
                    <RotateCcw className="mr-1.5 size-3.5" />
                    Reopen
                  </Button>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled={pendingId === c._id}>
                        <Archive className="mr-1.5 size-3.5" />
                        Archive
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive this challenge?</AlertDialogTitle>
                        <AlertDialogDescription>
                          “{c.title}” will disappear from the public catalog.
                          Its record is preserved and an administrator can
                          reopen it at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep it live</AlertDialogCancel>
                        <AlertDialogAction onClick={() => archive(c._id, c.title)}>
                          Archive challenge
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
