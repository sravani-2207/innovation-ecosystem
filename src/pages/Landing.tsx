import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeCard } from "@/components/ChallengeCard";
import { PublicNav, PublicFooter } from "@/components/PublicChrome";
import { UdbhavaMark } from "@/components/UdbhavaLogo";
import { LoadingGrid } from "@/components/states";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import {
  BrainCircuit,
  Building2,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  Search,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const FLOW = [
  { icon: Target, label: "Problem" },
  { icon: Search, label: "Discover" },
  { icon: Users, label: "Build Teams" },
  { icon: Lightbulb, label: "Innovate" },
  { icon: BrainCircuit, label: "Validate" },
  { icon: Sparkles, label: "Improve" },
  { icon: Rocket, label: "Impact" },
];

const HOW = [
  {
    icon: Building2,
    step: "01 · Publish",
    title: "A problem enters the workspace",
    body: "Someone describes a real problem in plain language. The analyzer returns structure — domain, difficulty, sub-problems, required skills — which the publisher reviews and refines before it goes live.",
  },
  {
    icon: Search,
    step: "02 · Discover",
    title: "The right people find it",
    body: "Every open challenge is scored against each member's skills, interests and availability. The catalog puts the strongest fits first, so nobody scrolls through noise.",
  },
  {
    icon: Users,
    step: "03 · Commit",
    title: "Joining creates a workspace",
    body: "When a member joins, the challenge tracks their participation and the path forward unlocks — team formation, ideas, mentoring and delivery — in version two.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45, ease: "easeOut" as const },
};

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const challenges = useQuery(api.challenges.listPublic);
  const stats = useQuery(api.meta.platformStats);

  const featured = (challenges ?? []).slice(0, 3);
  const loading = challenges === undefined;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-warm dark:hero-warm-dark border-b border-border/60">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="animate-emerge">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                udbhava · from emergence to existence
              </p>
              <h1 className="text-4xl leading-[1.06] font-semibold tracking-tight text-foreground sm:text-5xl">
                Problems come in rough.
                <span className="mt-2 block text-muted-foreground">
                  Solutions leave finished.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                udbhava is the workspace our team runs itself on — a quiet place
                where real problems are written down, understood, matched to the
                right people, and worked through to existence.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                {!isLoading && isAuthenticated ? (
                  <Button size="lg" onClick={() => navigate("/dashboard")}>
                    Open your dashboard
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={() => navigate("/auth")}>
                      Log in
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => navigate("/auth?mode=register")}
                    >
                      Create account
                    </Button>
                  </>
                )}
                <Button size="lg" variant="ghost" onClick={() => navigate("/challenges")}>
                  Browse the catalog
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4 text-primary" /> Organizations
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-primary" /> Students
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-primary" /> Teams
                </span>
                <span className="flex items-center gap-1.5">
                  <Handshake className="size-4 text-primary" /> Administration
                </span>
              </div>
            </div>

            {/* Emergence visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-md"
            >
              <Card className="soft-shadow border-border/80 bg-card/85 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Emergence → existence
                    </span>
                    <UdbhavaMark className="size-7" />
                  </div>
                  <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
                    {FLOW.map((s, i) => (
                      <motion.li
                        key={s.label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.35 }}
                        className="flex items-center gap-3"
                      >
                        <span
                          className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                            i === 0
                              ? "border-primary/40 bg-accent text-primary"
                              : i === FLOW.length - 1
                                ? "border-success/40 bg-success/10 text-success"
                                : "border-border bg-card text-muted-foreground"
                          }`}
                        >
                          <s.icon className="size-3.5" />
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {s.label}
                        </span>
                      </motion.li>
                    ))}
                  </ol>
                  <p className="mt-5 border-t border-border/60 pt-4 text-xs leading-5 text-muted-foreground">
                    Every challenge travels this path inside one system —
                    nothing is lost between tools.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-b border-border/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp}>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                How the workspace works
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Three movements, one continuous record. Nothing is tracked in a
                side channel.
              </p>
            </motion.div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {HOW.map((c, i) => (
                <motion.div
                  key={c.step}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.07 }}
                >
                  <Card className="soft-shadow h-full border-border/80">
                    <CardContent className="p-6">
                      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                        <c.icon className="size-4.5" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        {c.step}
                      </p>
                      <h3 className="mt-1.5 text-[15px] font-semibold">{c.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {c.body}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Live catalog preview */}
        <section className="border-b border-border/60 bg-muted/40 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div
              {...fadeUp}
              className="mb-8 flex flex-wrap items-end justify-between gap-3"
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  From the catalog
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Problems currently open inside the workspace.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/challenges")}>
                View everything
              </Button>
            </motion.div>
            {loading ? (
              <LoadingGrid count={3} />
            ) : featured.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  The catalog is empty. The first published challenge will
                  appear here.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((c) => (
                  <ChallengeCard key={c._id} challenge={c} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border/60 bg-secondary/40 py-14">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4">
            {[
              { value: stats?.challenges ?? "—", label: "Challenges published" },
              { value: stats?.students ?? "—", label: "Student members" },
              { value: stats?.organizations ?? "—", label: "Organizations" },
              { value: stats?.participants ?? "—", label: "Participations" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-semibold tabular-nums text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp}>
              <Card className="soft-shadow overflow-hidden border-border/80">
                <CardContent className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Bring the next problem in
                    </h2>
                    <p className="mt-2 max-w-xl text-muted-foreground">
                      Write it in plain language. The workspace takes care of
                      structure, matching and follow-through.
                    </p>
                  </div>
                  <Button size="lg" onClick={() => navigate("/auth?mode=register")}>
                    Create account
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
