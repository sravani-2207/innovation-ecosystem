import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  BrainCircuit,
  Building2,
  GraduationCap,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useQuery(api.admin.stats, {});

  const cards = [
    { icon: Users, label: "Members", value: stats?.members },
    { icon: GraduationCap, label: "Students", value: stats?.students },
    { icon: Building2, label: "Organizations", value: stats?.organizations },
    { icon: Target, label: "Challenges", value: stats?.challenges },
    {
      icon: BrainCircuit,
      label: "AI-analyzed",
      value: stats?.aiAnalyzed,
    },
    { icon: Target, label: "Participations", value: stats?.participations },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 md:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4" /> Administration
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Workspace overview
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Signed in as {user?.email} — everything in this deployment is
            managed from here.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/users")}>
            Manage members
          </Button>
          <Button onClick={() => navigate("/admin/challenges")}>
            Manage challenges
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/80">
            <CardContent className="p-4">
              <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                <c.icon className="size-4" />
              </div>
              <p className="text-xl font-semibold tabular-nums">
                {c.value ?? "—"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health notes */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Membership</CardTitle>
            <CardDescription>
              Accounts and their current standing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Active members" value={String(stats?.members ?? "—")} />
            <Row
              label="Deactivated"
              value={String(stats?.deactivated ?? "—")}
              tone={stats && stats.deactivated > 0 ? "warning" : undefined}
            />
            <Row label="Administrators" value={String(stats?.admins ?? "—")} />
            <Row
              label="Awaiting onboarding"
              value={
                stats
                  ? `${Math.max(0, stats.members - stats.students - stats.organizations - stats.admins)}`
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Catalog</CardTitle>
            <CardDescription>
              Challenge flow through the workspace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Live for participation" value={String(stats?.challengesLive ?? "—")} />
            <Row label="Archived" value={String(stats?.challengesArchived ?? "—")} />
            <Row label="Structured by AI" value={String(stats?.aiAnalyzed ?? "—")} />
            <Row label="Participations" value={String(stats?.participations ?? "—")} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warning";
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          tone === "warning"
            ? "font-medium text-warning"
            : "font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
