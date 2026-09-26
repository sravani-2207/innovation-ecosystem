import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { subProblemValidator } from "./schema";
import { scoreMatch } from "./lib/scoring";
import type { Doc, Id } from "./_generated/dataModel";

const challengeInput = v.object({
  title: v.string(),
  problemStatement: v.string(),
  context: v.optional(v.string()),
  objectives: v.array(v.string()),
  expectedOutcome: v.optional(v.string()),
  constraints: v.array(v.string()),
  domain: v.string(),
  difficulty: v.string(),
  requiredSkills: v.array(v.string()),
  preferredSkills: v.array(v.string()),
  location: v.optional(v.string()),
  availability: v.optional(v.string()),
  deadline: v.optional(v.number()),
  evaluationCriteria: v.array(v.string()),
});

function toMatchChallenge(ch: Doc<"challenges">) {
  return {
    title: ch.title,
    problemStatement: ch.problemStatement,
    domain: ch.domain,
    difficulty: ch.difficulty,
    requiredSkills: ch.requiredSkills,
    preferredSkills: ch.preferredSkills,
    location: ch.location,
    availability: ch.availability,
  };
}

async function getStudentDoc(
  ctx: QueryCtx,
  userId: Id<"users">,
): Promise<Doc<"profiles"> | null> {
  return ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
}

/** Public challenge feed: everything not draft/archived. */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("challenges").collect();
    return all
      .filter((c) => c.status !== "draft" && c.status !== "archived")
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

/** Public detail for a challenge; includes AI analysis when present. */
export const getPublic = query({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const challenge = await ctx.db.get(id);
    if (!challenge) return null;
    if (challenge.status === "draft" || challenge.status === "archived") {
      return null;
    }
    return challenge;
  },
});

/** Challenges owned by the signed-in organization (drafts included). */
export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const all = await ctx.db.query("challenges").collect();
    return all
      .filter((c) => c.orgUserId === userId)
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0));
  },
});

/** Create a challenge as a draft or publish immediately. */
export const create = mutation({
  args: { input: challengeInput, publish: v.boolean() },
  handler: async (ctx, { input, publish }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const profile = await getStudentDoc(ctx, userId);
    if (!profile || profile.role !== "organization") {
      throw new Error("Only organizations can post challenges.");
    }
    return ctx.db.insert("challenges", {
      ...input,
      orgUserId: userId,
      orgName: profile.orgName ?? "Organization",
      status: publish ? "open_for_participation" : "draft",
      subProblems: [],
      participantsCount: 0,
    });
  },
});

/** Replace AI-generated (or manually edited) analysis for an owned challenge. */
export const saveAnalysis = mutation({
  args: {
    id: v.id("challenges"),
    subProblems: v.array(subProblemValidator),
    analysisSummary: v.string(),
  },
  handler: async (ctx, { id, subProblems, analysisSummary }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const challenge = await ctx.db.get(id);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.orgUserId !== userId) throw new Error("Not your challenge");
    await ctx.db.patch(id, {
      subProblems,
      analysisSummary,
      aiAnalyzedAt: Date.now(),
    });
  },
});

/** Publish a draft challenge owned by the signed-in organization. */
export const publish = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const challenge = await ctx.db.get(id);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.orgUserId !== userId) throw new Error("Not your challenge");
    if (challenge.status !== "draft") throw new Error("Already published");
    await ctx.db.patch(id, { status: "open_for_participation" });
  },
});

/** Delete a draft challenge owned by the signed-in organization. */
export const removeDraft = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const challenge = await ctx.db.get(id);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.orgUserId !== userId) throw new Error("Not your challenge");
    if (challenge.status !== "draft") {
      throw new Error("Only drafts can be deleted.");
    }
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", id))
      .collect();
    for (const p of participants) await ctx.db.delete(p._id);
    await ctx.db.delete(id);
  },
});

/** Join a public challenge as a student. */
export const join = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const challenge = await ctx.db.get(id);
    if (!challenge) throw new Error("Challenge not found");
    if (challenge.status === "draft" || challenge.status === "archived") {
      throw new Error("This challenge is not open for participation.");
    }
    const profile = await getStudentDoc(ctx, userId);
    if (!profile || profile.role !== "student") {
      throw new Error("Only students can join challenges.");
    }
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", id))
      .collect();
    if (existing.some((p) => p.userId === userId)) {
      return; // already joined
    }
    await ctx.db.insert("participants", {
      challengeId: id,
      userId,
      joinedAt: Date.now(),
    });
    await ctx.db.patch(id, {
      participantsCount: challenge.participantsCount + 1,
    });
  },
});

/** Leave a challenge before team formation (allowed while status is open). */
export const leave = mutation({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const challenge = await ctx.db.get(id);
    if (!challenge) throw new Error("Challenge not found");
    const mine = await ctx.db
      .query("participants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", id))
      .collect();
    const row = mine.find((p) => p.userId === userId);
    if (!row) return;
    if (challenge.status !== "open_for_participation" && challenge.status !== "published") {
      throw new Error("You can only leave before team formation starts.");
    }
    await ctx.db.delete(row._id);
    await ctx.db.patch(id, {
      participantsCount: Math.max(0, challenge.participantsCount - 1),
    });
  },
});

/** Whether the signed-in user has joined the given challenge. */
export const hasJoined = query({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const rows = await ctx.db
      .query("participants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", id))
      .collect();
    return rows.some((p) => p.userId === userId);
  },
});

/** Challenges the signed-in student has joined, with personal match data. */
export const listJoined = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const out = [];
    for (const row of rows) {
      const challenge = await ctx.db.get(row.challengeId);
      if (challenge) out.push({ challenge, joinedAt: row.joinedAt });
    }
    return out.sort((a, b) => b.joinedAt - a.joinedAt);
  },
});

/** Challenges the signed-in student joined, joined with match analysis. */
export const listJoinedWithMatch = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const profile = await getStudentDoc(ctx, userId);
    const out = [];
    for (const row of rows) {
      const challenge = await ctx.db.get(row.challengeId);
      if (!challenge) continue;
      const match = profile
        ? scoreMatch(
            {
              skills: profile.skills,
              interests: profile.interests,
              experienceLevel: profile.experienceLevel,
              location: profile.location,
              availability: profile.availability,
            },
            toMatchChallenge(challenge),
          )
        : { score: 0, matched: [], missing: [], notes: [] };
      out.push({ challenge, joinedAt: row.joinedAt, match });
    }
    return out.sort((a, b) => b.match.score - a.match.score);
  },
});

/** Participants (public-safe) of a challenge. */
export const listParticipants = query({
  args: { id: v.id("challenges") },
  handler: async (ctx, { id }) => {
    const rows = await ctx.db
      .query("participants")
      .withIndex("by_challenge", (q) => q.eq("challengeId", id))
      .collect();
    const out = [];
    for (const row of rows) {
      const user = await ctx.db.get(row.userId);
      const profile = await getStudentDoc(ctx, row.userId);
      out.push({
        joinedAt: row.joinedAt,
        name: user?.name ?? "Anonymous",
        college: profile?.college,
        skills: profile?.skills ?? [],
      });
    }
    return out;
  },
});

/**
 * AI Challenge Recommendations for the signed-in student, computed with the
 * deterministic scoring engine. Also includes the peer cohort (other
 * students' public profiles) used for "similar innovators".
 */
export const listRecommended = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const profile = await getStudentDoc(ctx, userId);
    if (!profile || profile.role !== "student") return [];

    const all = await ctx.db.query("challenges").collect();
    const visible = all.filter(
      (c) => c.status !== "draft" && c.status !== "archived",
    );
    const joined = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const joinedIds = new Set(joined.map((j) => j.challengeId));

    const scored = visible
      .filter((c) => !joinedIds.has(c._id))
      .map((challenge) => ({
        challenge,
        match: scoreMatch(
          {
            skills: profile.skills,
            interests: profile.interests,
            experienceLevel: profile.experienceLevel,
            location: profile.location,
            availability: profile.availability,
          },
          toMatchChallenge(challenge),
        ),
      }));
    return scored.sort((a, b) => b.match.score - a.match.score);
  },
});

/** Peer students (public-safe) for the signed-in student's network view. */
export const listPeers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();
    const out = [];
    for (const p of profiles) {
      if (p.userId === userId) continue;
      const user = await ctx.db.get(p.userId);
      if (!user || user.isAnonymous) continue;
      out.push({
        userId: p.userId,
        name: user.name ?? "Anonymous",
        college: p.college,
        department: p.department,
        skills: p.skills,
        interests: p.interests,
        experienceLevel: p.experienceLevel,
      });
    }
    return out;
  },
});
