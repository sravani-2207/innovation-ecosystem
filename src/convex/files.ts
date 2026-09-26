import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upload portal plumbing. The client requests a short-lived upload URL,
 * PUTs the file directly to storage, then attaches the resulting storage id
 * to the idea. Download URLs are short-lived, so private attachments are not
 * permanently public.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Resolve a storage id to a downloadable URL (short-lived). */
export const getFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    // Any signed-in workspace member may open idea attachments.
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.storage.getUrl(storageId);
  },
});

/** Delete a stored file (used when an attachment is removed/replaced). */
export const deleteFile = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.storage.delete(storageId);
  },
});
