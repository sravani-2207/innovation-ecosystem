import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { ChallengeAnalysis } from "./ai";

/**
 * Public wrapper around the internal AI analyzer. Any signed-in visitor can
 * invoke it; it performs no database access. Ownership is enforced later when
 * the organization saves the analysis via `challenges.saveAnalysis`.
 */
export const analyzeChallenge = action({
  args: {
    title: v.string(),
    problemStatement: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ChallengeAnalysis> => {
    return (await ctx.runAction(internal.ai.analyzeChallenge, args)) as ChallengeAnalysis;
  },
});
