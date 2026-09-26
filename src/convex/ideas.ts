import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";

/**
 * Create an idea for a challenge. The student must have joined the challenge
 * first; the file itself stays on the client (local prototype), but its name
 * and type are recorded so reviewers see what was attached.
 */
export const create = mutation({
  args: {
    challengeId: v.id("challenges"),
    title: v.string(),
    description: v.string(),
    technologies: v.array(v.string()),
    fileName: v.optional(v.string()),
    fileType: v.optional(v.string()),
  },
  handler: async (ctx, { challengeId, title, description, technologies, fileName, fileType }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!profile || profile.role !== ROLES.STUDENT) {
      throw new Error("Only students can submit ideas.");
    }

    // Must have joined the challenge first.
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", challengeId))
      .collect();
    if (!participant.some((p) => p.userId === userId)) {
      throw new Error("Join the challenge before submitting an idea.");
    }

    const user = await ctx.db.get(userId);
    return ctx.db.insert("ideas", {
      challengeId,
      studentUserId: userId,
      studentName: user?.name ?? "Student",
      title: title.trim(),
      description: description.trim(),
      technologies,
      fileName,
      fileType,
    });
  },
});

/** Attach AI analysis to an idea (owner only). */
export const saveAnalysis = mutation({
  args: {
    ideaId: v.id("ideas"),
    analysis: v.object({
      problemUnderstanding: v.string(),
      strengths: v.array(v.string()),
      missing: v.array(v.string()),
      suggestions: v.array(v.string()),
      expectedImpact: v.string(),
    }),
  },
  handler: async (ctx, { ideaId, analysis }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const idea = await ctx.db.get(ideaId);
    if (!idea) throw new Error("Idea not found");
    if (idea.studentUserId !== userId) throw new Error("Not your idea");
    await ctx.db.patch(ideaId, {
      analysis: { ...analysis, analyzedAt: Date.now() },
    });
  },
});

/** The signed-in student's idea for a given challenge (or null). */
export const getMineForChallenge = query({
  args: { challengeId: v.id("challenges") },
  handler: async (ctx, { challengeId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const rows = await ctx.db
      .query("ideas")
      .withIndex("by_challenge", (q) => q.eq("challengeId", challengeId))
      .collect();
    return rows.find((r) => r.studentUserId === userId) ?? null;
  },
});

/** All ideas across the signed-in organization's challenges. */
export const listForOrg = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const myChallenges = await ctx.db
      .query("challenges")
      .withIndex("by_org", (q) => q.eq("orgUserId", userId))
      .collect();
    const challengeById = new Map(myChallenges.map((c) => [c._id, c]));

    const out = [];
    for (const [challengeId, challenge] of challengeById) {
      const ideas = await ctx.db
        .query("ideas")
        .withIndex("by_challenge", (q) => q.eq("challengeId", challengeId as never))
        .collect();
      for (const idea of ideas) {
        // Basic student details for the org's review view.
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", idea.studentUserId))
          .first();
        const user = await ctx.db.get(idea.studentUserId);
        out.push({
          idea,
          challenge,
          student: {
            name: user?.name ?? "Student",
            email: user?.email ?? "—",
            college: profile?.college,
            course: profile?.course,
            year: profile?.year,
            location: profile?.location,
            skills: profile?.skills ?? [],
            interests: profile?.interests ?? [],
          },
        });
      }
    }
    return out.sort((a, b) => b.idea._creationTime - a.idea._creationTime);
  },
});
