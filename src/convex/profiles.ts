import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ROLES, roleValidator } from "./schema";

/** Returns { user, profile } for the signed-in user (nulls when signed out). */
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return { user, profile };
  },
});

/** Public-safe profile of any user (for cards, lists, org display). */
export const getPublicProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return {
      name: user.name ?? "Anonymous",
      orgName: profile?.orgName,
      college: profile?.college,
      role: profile?.role ?? user.role,
      skills: profile?.skills ?? [],
      interests: profile?.interests ?? [],
      experienceLevel: profile?.experienceLevel,
      location: profile?.location,
    };
  },
});

const orgSchema = v.object({
  orgName: v.string(),
  orgWebsite: v.optional(v.string()),
  about: v.optional(v.string()),
  location: v.optional(v.string()),
});

const studentSchema = v.object({
  firstName: v.string(),
  lastName: v.string(),
  college: v.string(),
  department: v.optional(v.string()),
  course: v.optional(v.string()),
  year: v.optional(v.string()),
  location: v.optional(v.string()),
  skills: v.array(v.string()),
  interests: v.array(v.string()),
  experienceLevel: v.optional(v.string()),
  availability: v.optional(v.string()),
  github: v.optional(v.string()),
  linkedin: v.optional(v.string()),
});

const adminSchema = v.object({
  firstName: v.string(),
  lastName: v.string(),
});

/**
 * Create or update the signed-in organization's profile.
 * Existing students cannot switch to an organization profile, and
 * deactivating an account is respected everywhere.
 */
export const saveOrgProfile = mutation({
  args: orgSchema,
  handler: async (ctx, input) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const role =
      existing?.role === ROLES.ADMIN ? existing.role : ROLES.ORGANIZATION;
    if (existing && existing.role === ROLES.STUDENT) {
      throw new Error("This account already has a student profile.");
    }

    const data = {
      ...input,
      userId,
      role,
      skills: [],
      interests: [],
      onboarded: true,
      active: true,
    };
    const profileId = existing
      ? await ctx.db.patch(existing._id, data)
      : await ctx.db.insert("profiles", data);
    if (user.name !== input.orgName) {
      await ctx.db.patch(userId, { name: input.orgName });
    }
    return profileId;
  },
});

/** Create or update the signed-in student's profile. */
export const saveStudentProfile = mutation({
  args: studentSchema,
  handler: async (ctx, input) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    const role = existing?.role === ROLES.ADMIN ? existing.role : ROLES.STUDENT;
    if (existing && existing.role === ROLES.ORGANIZATION) {
      throw new Error("This account already has an organization profile.");
    }

    const data = {
      ...input,
      userId,
      role,
      onboarded: true,
      active: true,
    };
    const profileId = existing
      ? await ctx.db.patch(existing._id, data)
      : await ctx.db.insert("profiles", data);
    const fullName = `${input.firstName} ${input.lastName}`.trim();
    if (user.name !== fullName) {
      await ctx.db.patch(userId, { name: fullName });
    }
    return profileId;
  },
});

/** Create or update the signed-in admin's minimal profile. */
export const saveAdminProfile = mutation({
  args: adminSchema,
  handler: async (ctx, input) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Only brand-new accounts may take the admin role.
    if (existing && existing.role !== ROLES.ADMIN) {
      throw new Error("This account already has a different role.");
    }

    const data = {
      userId,
      role: ROLES.ADMIN,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      skills: [],
      interests: [],
      onboarded: true,
      active: true,
    };
    const profileId = existing
      ? await ctx.db.patch(existing._id, data)
      : await ctx.db.insert("profiles", data);
    const fullName = `${input.firstName} ${input.lastName}`.trim();
    if (user.name !== fullName) {
      await ctx.db.patch(userId, { name: fullName });
    }
    return profileId;
  },
});

/**
 * One-time role choice at onboarding for accounts without a profile yet.
 * Admin is only claimable while no profile exists (single-tenant trust model:
 * the first person who sets up this private deployment takes the keys).
 */
export const setInitialRole = mutation({
  args: { role: roleValidator },
  handler: async (ctx, { role }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) return existing._id;
    return ctx.db.insert("profiles", {
      userId,
      role,
      skills: [],
      interests: [],
      onboarded: false,
      active: true,
    });
  },
});

/** True once any admin profile exists (first-claim guard for the UI). */
export const adminExists = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", ROLES.ADMIN))
      .first();
    return admins !== null;
  },
});
