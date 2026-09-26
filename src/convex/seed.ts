import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Kicks the AI demo seed action after a short delay. Scheduled by the client
 * via the `seedDemo` mutation wrapper in meta.ts. The AI action generates the
 * challenge content, then `insertSeededChallenges` stores it under the demo
 * organization account.
 */
export const kickSeed = internalMutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(500, internal.aiSeed.seedDemoChallenges, {});
  },
});