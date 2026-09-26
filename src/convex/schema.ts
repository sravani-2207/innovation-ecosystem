import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Udbhava roles. Admin exists in the data model but is not publicly selectable.
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  ORGANIZATION: "organization",
  MENTOR: "mentor",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.ORGANIZATION),
  v.literal(ROLES.MENTOR),
);
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Challenge lifecycle (v1 uses draft → open_for_participation).
export const CHALLENGE_STATUSES = [
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
] as const;

export const subProblemValidator = v.object({
  title: v.string(),
  description: v.string(),
  whyItMatters: v.string(),
  direction: v.string(),
  skills: v.array(v.string()),
});

const schema = defineSchema(
  {
    // Default auth tables using convex auth.
    ...authTables, // do not remove or modify

    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove
      role: v.optional(roleValidator),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    /** Role-aware profile filled during onboarding; powers AI matching. */
    profiles: defineTable({
      userId: v.id("users"),
      role: roleValidator,
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      // Organization fields
      orgName: v.optional(v.string()),
      orgWebsite: v.optional(v.string()),
      about: v.optional(v.string()),
      // Student fields
      college: v.optional(v.string()),
      department: v.optional(v.string()),
      course: v.optional(v.string()),
      year: v.optional(v.string()),
      skills: v.array(v.string()),
      interests: v.array(v.string()),
      experienceLevel: v.optional(v.string()),
      location: v.optional(v.string()),
      availability: v.optional(v.string()),
      github: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      onboarded: v.boolean(),
    })
      .index("by_user", ["userId"])
      .index("by_role", ["role"]),

    /** Real-world societal / industry challenges. */
    challenges: defineTable({
      orgUserId: v.id("users"),
      orgName: v.string(),
      title: v.string(),
      problemStatement: v.string(),
      context: v.optional(v.string()),
      objectives: v.array(v.string()),
      expectedOutcome: v.optional(v.string()),
      constraints: v.array(v.string()),
      domain: v.string(),
      difficulty: v.string(), // Beginner | Intermediate | Advanced
      requiredSkills: v.array(v.string()),
      preferredSkills: v.array(v.string()),
      location: v.optional(v.string()),
      availability: v.optional(v.string()),
      deadline: v.optional(v.number()),
      evaluationCriteria: v.array(v.string()),
      status: v.string(),
      // AI Challenge Analyzer output (editable by the organization)
      subProblems: v.array(subProblemValidator),
      analysisSummary: v.optional(v.string()),
      aiAnalyzedAt: v.optional(v.number()),
      participantsCount: v.number(),
    })
      .index("by_status", ["status"])
      .index("by_org", ["orgUserId"]),

    /** A student's participation in a challenge. */
    participants: defineTable({
      challengeId: v.id("challenges"),
      userId: v.id("users"),
      joinedAt: v.number(),
    })
      .index("by_challenge", ["challengeId"])
      .index("by_user", ["userId"]),

    /** One-off system markers (e.g. "demo data seeded"). */
    meta: defineTable({
      key: v.string(),
    }).index("by_key", ["key"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
