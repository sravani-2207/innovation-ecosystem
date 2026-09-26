import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

/** Whether demo data has already been seeded. */
export const isSeeded = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", "demo_seeded"))
      .first();
    return row !== null;
  },
});

/** Marks demo data as seeded (idempotent guard). */
export const markSeeded = internalMutation({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", "demo_seeded"))
      .first();
    if (row) return;
    await ctx.db.insert("meta", { key: "demo_seeded" });
  },
});

/** Count of visible public challenges (for platform stats). */
export const publicChallengeCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("challenges").collect();
    return all.filter((c) => c.status !== "draft" && c.status !== "archived")
      .length;
  },
});

/** Stats for the landing page (public). */
export const platformStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("challenges").collect();
    const visible = all.filter(
      (c) => c.status !== "draft" && c.status !== "archived",
    );
    const participants = await ctx.db.query("participants").collect();
    const profiles = await ctx.db.query("profiles").collect();
    return {
      challenges: visible.length,
      participants: participants.length,
      students: profiles.filter((p) => p.role === "student").length,
      organizations: profiles.filter((p) => p.role === "organization").length,
    };
  },
});

/**
 * Insert AI-seeded demo challenges as a real organization's challenges.
 * Called from the client via a wrapper mutation after `seedDemoChallenges`
 * finishes; guarded so it only ever runs once.
 */
export const insertSeededChallenges = internalMutation({
  args: {
    orgUserId: v.id("users"),
    orgName: v.string(),
    challenges: v.array(
      v.object({
        title: v.string(),
        problemStatement: v.string(),
        context: v.optional(v.string()),
        domain: v.string(),
        difficulty: v.string(),
        requiredSkills: v.array(v.string()),
        preferredSkills: v.array(v.string()),
        objectives: v.array(v.string()),
        constraints: v.array(v.string()),
        evaluationCriteria: v.array(v.string()),
        subProblems: v.array(
          v.object({
            title: v.string(),
            description: v.string(),
            whyItMatters: v.string(),
            direction: v.string(),
            skills: v.array(v.string()),
          }),
        ),
        analysisSummary: v.string(),
      }),
    ),
  },
  handler: async (ctx, { orgUserId, orgName, challenges }) => {
    const row = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", "demo_seeding"))
      .first();
    if (!row) return; // only the reserve row created by seedDemo may insert

    for (const c of challenges) {
      await ctx.db.insert("challenges", {
        orgUserId,
        orgName,
        title: c.title,
        problemStatement: c.problemStatement,
        context: c.context,
        objectives: c.objectives,
        expectedOutcome: undefined,
        constraints: c.constraints,
        domain: c.domain,
        difficulty: c.difficulty,
        requiredSkills: c.requiredSkills,
        preferredSkills: c.preferredSkills,
        location: undefined,
        availability: undefined,
        deadline: undefined,
        evaluationCriteria: c.evaluationCriteria,
        status: "open_for_participation",
        subProblems: c.subProblems,
        analysisSummary: c.analysisSummary,
        aiAnalyzedAt: Date.now(),
        participantsCount: 3 + Math.floor(Math.random() * 9),
      });
    }
    await ctx.db.insert("meta", { key: "demo_seeded" });
    await ctx.db.delete(row._id);
  },
});

/**
 * Client-callable seed trigger. Schedules the AI demo seed exactly once;
 * further calls are no-ops. Returns true when a seed was started.
 */
export const seedDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const done = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", "demo_seeded"))
      .first();
    if (done) return false;
    // Reserve immediately so parallel callers don't double-seed.
    const reserving = await ctx.db
      .query("meta")
      .withIndex("by_key", (q) => q.eq("key", "demo_seeding"))
      .first();
    if (reserving) return false;
    await ctx.db.insert("meta", { key: "demo_seeding" });
    await ctx.scheduler.runAfter(0, internal.seed.kickSeed, {});
    return true;
  },
});

/**
 * Creates (or returns) the demo organization account that owns the seeded
 * challenges, so the feed shows a believable publisher.
 */
export const ensureDemoOrg = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "demo@udbhava.org"))
      .first();
    if (existing) return { orgUserId: existing._id, orgName: "Udbhava Foundation" };

    const orgUserId = await ctx.db.insert("users", {
      name: "Udbhava Foundation",
      email: "demo@udbhava.org",
      emailVerificationTime: Date.now(),
    });
    await ctx.db.insert("profiles", {
      userId: orgUserId,
      role: "organization",
      orgName: "Udbhava Foundation",
      about:
        "Demo publisher account that seeds Udbhava with realistic, open societal challenges.",
      skills: [],
      interests: [],
      onboarded: true,
    });
    return { orgUserId, orgName: "Udbhava Foundation" };
  },
});
