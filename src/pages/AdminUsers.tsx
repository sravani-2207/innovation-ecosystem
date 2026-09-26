import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState, LoadingGrid } from "@/components/states";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "convex/react";
import { Search, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { profile } = useAuth();
  const users = useQuery(api.admin.listUsers, {});
  const setActive = useMutation(api.admin.setUserActive);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return `${u.name} ${u.email} ${u.orgName ?? ""} ${u.college ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [users, query, roleFilter]);

  const toggleActive = async (profileId: string, next: boolean, memberName: string) => {
    setPendingId(profileId);
    try {
      await setActive({ profileId: profileId as never, active: next });
      toast.success(
        next
          ? `${memberName} has been reactivated.`
          : `${memberName} has been deactivated.`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update this member.",
      );
    } finally {
      setPendingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10">
      <header className="mb-6">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4" /> Administration
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Members
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everyone with an account in this workspace. Deactivation pauses
          access without deleting any history.
        </p>
      </header>

      {/* Search + filter */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or organization…"
            className="border-0 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-9 w-full bg-secondary/60 sm:w-[180px]">
            <UserCog className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="organization">Organizations</SelectItem>
            <SelectItem value="admin">Administrators</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {users === undefined ? (
        <LoadingGrid count={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserCog className="size-5" />}
          title="No members match"
          description="Try a different search term or clear the role filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <Card key={u.profileId} className="soft-shadow border-border/80">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{u.name}</span>
                    <RoleBadge role={u.role} />
                    {!u.active && (
                      <Badge
                        variant="outline"
                        className="border-destructive/30 bg-destructive/10 text-destructive"
                      >
                        Deactivated
                      </Badge>
                    )}
                    {!u.onboarded && (
                      <Badge variant="outline" className="border-border bg-muted text-muted-foreground">
                        Onboarding incomplete
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.email}
                    {u.orgName ? ` · ${u.orgName}` : ""}
                    {u.college ? ` · ${u.college}` : ""}
                    {" · "}joined{" "}
                    {new Date(u.joinedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {u.role !== "admin" && u.userId !== profile?.userId && (
                  <Button
                    variant={u.active ? "outline" : "secondary"}
                    size="sm"
                    disabled={pendingId === u.profileId}
                    onClick={() => toggleActive(u.profileId, !u.active, u.name)}
                  >
                    {u.active ? (
                      <>
                        <ShieldOff className="mr-1.5 size-3.5" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-1.5 size-3.5" />
                        Reactivate
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    student: "border-primary/25 bg-accent text-accent-foreground",
    organization: "border-border bg-secondary text-secondary-foreground",
    admin: "border-success/30 bg-success/10 text-success",
  };
  const labels: Record<string, string> = {
    student: "Student",
    organization: "Organization",
    admin: "Administrator",
  };
  return (
    <Badge variant="outline" className={styles[role] ?? styles.organization}>
      {labels[role] ?? role}
    </Badge>
  );
}
