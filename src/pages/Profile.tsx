import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengeStatus, SkillBadge } from "@/components/badges";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { Building2, GraduationCap } from "lucide-react";
import { Link } from "react-router";

export default function Profile() {
  const { user, signOut } = useAuth();
  const mine = useQuery(api.challenges.listMine, {});
  const data = useQuery(api.profiles.getCurrentProfile, {});
  const profile = data?.profile;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
        <p className="mt-1.5 text-muted-foreground">
          {user?.email ?? "Signed in user"} ·{" "}
          <span className="font-medium text-foreground">
            {profile?.role ?? user?.role ?? "member"}
          </span>
        </p>
      </header>

      <div className="space-y-6">
        <Card className="soft-shadow border-border/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {profile?.role === "organization" ? (
                <>
                  <Building2 className="size-4 text-primary" /> Organization
                </>
              ) : (
                <>
                  <GraduationCap className="size-4 text-primary" /> Student
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {profile?.role === "organization" ? (
              <>
                <Row label="Organization" value={profile.orgName ?? "—"} />
                <Row label="Website" value={profile.orgWebsite ?? "—"} />
                <Row label="About" value={profile.about ?? "—"} />
                <Row label="Location" value={profile.location ?? "—"} />
              </>
            ) : (
              <>
                <Row
                  label="Name"
                  value={
                    profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "—" : user?.name ?? "—"
                  }
                />
                <Row label="College" value={profile?.college ?? "—"} />
                <Row label="Department" value={profile?.department ?? "—"} />
                <Row label="Year" value={profile?.year ?? "—"} />
                <Row label="Experience" value={profile?.experienceLevel ?? "—"} />
                <Row label="Availability" value={profile?.availability ?? "—"} />
                <div>
                  <p className="mb-1.5 font-medium text-muted-foreground">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile?.skills ?? []).map((s) => (
                      <SkillBadge key={s} skill={s} />
                    ))}
                    {(profile?.skills ?? []).length === 0 && (
                      <span className="text-muted-foreground">None yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 font-medium text-muted-foreground">Interests</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile?.interests ?? []).map((s) => (
                      <SkillBadge key={s} skill={s} />
                    ))}
                    {(profile?.interests ?? []).length === 0 && (
                      <span className="text-muted-foreground">None yet</span>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link to="/onboarding">Edit profile</Link>
              </Button>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>

        {profile?.role === "organization" && mine !== undefined && (
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Published challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mine.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No challenges yet — post one from the dashboard.
                </p>
              ) : (
                mine.map((c) => (
                  <div
                    key={c._id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <Link to={`/challenges/${c._id}`} className="text-sm font-medium hover:text-primary">
                      {c.title}
                    </Link>
                    <ChallengeStatus status={c.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border/50 pb-2">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
