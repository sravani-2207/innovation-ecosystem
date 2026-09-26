import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";

async function requireAdmin(ctx: QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (!profile || profile.role !== ROLES.ADMIN || profile.active === false) {
    throw new Error("Admin access required.");
  }
  return userId;
}

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const challenges = await ctx.db.query("challenges").collect();
    const profiles = await ctx.db.query("profiles").collect();
    const participants = await ctx.db.query("participants").collect();
    const aiAnalyzed = challenges.filter((c) => c.aiAnalyzedAt).length;
    return {
      members: profiles.length,
      students: profiles.filter((p) => p.role === "student").length,
      organizations: profiles.filter((p) => p.role === "organization").length,
      admins: profiles.filter((p) => p.role === "admin").length,
      deactivated: profiles.filter((p) => p.active === false).length,
      challenges: challenges.length,
      challengesLive: challenges.filter(
        (c) => c.status === "open_for_participation",
      ).length,
      challengesArchived: challenges.filter((c) => c.status === "archived").length,
      aiAnalyzed,
      participations: participants.length,
    };
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("profiles").collect();
    const out = [];
    for (const p of profiles) {
      const user = await ctx.db.get(p.userId);
      if (!user) continue;
      out.push({
        profileId: p._id,
        userId: p.userId,
        name: user.name ?? "—",
        email: user.email ?? "—",
        role: p.role,
        active: p.active !== false,
        onboarded: p.onboarded,
        college: p.college,
        orgName: p.orgName,
        skills: p.skills,
        joinedAt: p._creationTime,
      });
    }
    return out.sort((a, b) => b.joinedAt - a.joinedAt);
  },
});

/** Deactivate a member (they can no longer sign in to the workspace). */
export const setUserActive = mutation({
  args: { profileId: v.id("profiles"), active: v.boolean() },
  handler: async (ctx, { profileId, active }) => {
    await requireAdmin(ctx);
    const profile = await ctx.db.get(profileId);
    if (!profile) throw new Error("Member not found");
    if (profile.role === ROLES.ADMIN && !active) {
      throw new Error("Admin accounts cannot be deactivated.");
    }
    await ctx.db.patch(profileId, { active });
  },
});

/** Admin lifecycle control for any challenge. */
export const setChallengeStatus = mutation({
  args: { challengeId: v.id("challenges"), status: v.string() },
  handler: async (ctx, { challengeId, status }) => {
    await requireAdmin(ctx);
    const allowed = [
      "draft",
      "published",
      "open_for_participation",
      "team_formation",
      "development",
      "submission_open",
      "evaluation",
      "improvement",
      "completed",
      "showcased",
      "archived",
    ];
    if (!allowed.includes(status)) throw new Error("Invalid status");
    await ctx.db.patch(challengeId, { status });
  },
});
