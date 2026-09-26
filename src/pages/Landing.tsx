import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeCard } from "@/components/ChallengeCard";
import { PublicNav, PublicFooter } from "@/components/PublicChrome";
import { UdbhavaMark } from "@/components/UdbhavaLogo";
import { LoadingGrid } from "@/components/states";
import { api } from "@/convex/_generated/api";
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

const WHY = [
  {
    icon: Target,
    title: "Real-world challenges",
    body: "Organizations and universities publish genuine societal and industry problems — not exercises.",
  },
  {
    icon: BrainCircuit,
    title: "AI-powered discovery",
    body: "Every challenge is decomposed into sub-problems and matched to your skills, interests and pace.",
  },
  {
    icon: Users,
    title: "Intelligent team formation",
    body: "Udbhava AI finds the missing skills around you and suggests complementary innovators.",
  },
  {
    icon: Handshake,
    title: "Industry feedback",
    body: "Structured evaluations from the organizations that own the problem — not just star ratings.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export default function Landing() {
  const navigate = useNavigate();
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
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="animate-emerge">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent/80 px-3 py-1 text-xs font-semibold text-accent-foreground">
                <Sparkles className="size-3.5" />
                The innovation ecosystem for academia + industry
              </div>
              <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                UDBHAVA
                <span className="mt-3 block text-2xl font-semibold text-primary sm:text-3xl lg:text-4xl">
                  Where Problems Become Possibilities.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                Connect real-world challenges with student innovators, mentors,
                and industry — from a raw problem statement to showcased,
                validated solutions.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate("/challenges")}>
                  Explore Challenges
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/40 text-primary hover:bg-accent hover:text-primary"
                  onClick={() => navigate("/auth?mode=register&role=organization")}
                >
                  Post a Challenge
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4 text-primary" /> Organizations
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="size-4 text-primary" /> Universities
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="size-4 text-primary" /> Student innovators
                </span>
                <span className="flex items-center gap-1.5">
                  <Handshake className="size-4 text-primary" /> Mentors
                </span>
              </div>
            </div>

            {/* Innovation lifecycle visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="relative mx-auto w-full max-w-md"
            >
              <Card className="soft-shadow border-border/80 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
                      Innovation lifecycle
                    </span>
                    <UdbhavaMark className="size-7" />
                  </div>
                  <ol className="relative space-y-3.5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
                    {FLOW.map((s, i) => (
                      <motion.li
                        key={s.label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.09, duration: 0.4 }}
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
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* How Udbhava works */}
        <section id="how" className="border-b border-border/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp}>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                How Udbhava works
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                One continuous journey — a real problem flows through discovery,
                teams, AI mentoring and evaluation until it becomes public
                knowledge.
              </p>
            </motion.div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Building2,
                  step: "1 · Post",
                  title: "Organizations publish real problems",
                  body: "Raw problem statements go through the AI Challenge Analyzer: domain, sub-problems, skills and constraints extracted.",
                },
                {
                  icon: Search,
                  step: "2 · Discover",
                  title: "Students find their fit",
                  body: "AI match scores rank every open challenge against your skills, interests, availability and experience.",
                },
                {
                  icon: Users,
                  step: "3 · Build",
                  title: "Teams form, ideas get mentored",
                  body: "AI finds the missing skills, then mentors your idea and generates a project roadmap with clear tasks.",
                },
                {
                  icon: Rocket,
                  step: "4 · Impact",
                  title: "Evaluation → improvement → showcase",
                  body: "Industry feedback becomes actionable improvement tasks. Approved solutions join the public showcase.",
                },
              ].map((c, i) => (
                <motion.div key={c.step} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
                  <Card className="soft-shadow h-full border-border/80">
                    <CardContent className="p-5">
                      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                        <c.icon className="size-4" />
                      </div>
                      <p className="text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
                        {c.step}
                      </p>
                      <h3 className="mt-1 text-[15px] font-semibold">{c.title}</h3>
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        {c.body}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Udbhava */}
        <section className="border-b border-border/60 bg-muted/40 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp}>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Why Udbhava?
              </h2>
            </motion.div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {WHY.map((w, i) => (
                <motion.div key={w.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
                  <Card className="h-full border-border/80">
                    <CardContent className="flex gap-4 p-5">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                        <w.icon className="size-4.5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{w.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {w.body}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured challenges */}
        <section className="border-b border-border/60 py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp} className="mb-8 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Featured challenges
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Live problems looking for innovators right now.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/challenges")}>
                View all
              </Button>
            </motion.div>
            {loading ? (
              <LoadingGrid count={3} />
            ) : featured.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  The first challenges are being published. Check back shortly.
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
        <section className="border-b border-border/60 bg-secondary/50 py-14">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4">
            {[
              { value: stats?.challenges ?? "—", label: "Active challenges" },
              { value: stats?.students ?? "—", label: "Student innovators" },
              { value: stats?.organizations ?? "—", label: "Organizations" },
              { value: stats?.participants ?? "—", label: "Participations" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold tabular-nums text-foreground">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <motion.div {...fadeUp}>
              <Card className="soft-shadow overflow-hidden border-primary/25 bg-gradient-to-br from-accent via-background to-background">
                <CardContent className="flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Have a problem worth solving?
                    </h2>
                    <p className="mt-2 max-w-xl text-muted-foreground">
                      Publish your real-world challenge and let student
                      innovators, AI analysis and mentors turn it into a
                      solution.
                    </p>
                  </div>
                  <Button size="lg" onClick={() => navigate("/auth?mode=register&role=organization")}>
                    Post a Challenge
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
