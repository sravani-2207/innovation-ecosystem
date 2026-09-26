"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { vly } from "../lib/vly-integrations";
import { SKILLS } from "../lib/constants";

export interface SubProblem {
  title: string;
  description: string;
  whyItMatters: string;
  direction: string;
  skills: string[];
}

export interface ChallengeAnalysis {
  domain: string;
  difficulty: string;
  requiredSkills: string[];
  preferredSkills: string[];
  objectives: string[];
  constraints: string[];
  evaluationCriteria: string[];
  subProblems: SubProblem[];
  summary: string;
}

/**
 * Udbhava AI Challenge Analyzer.
 *
 * Takes a raw problem statement from an organization and returns structured
 * JSON: domain, difficulty, skills, objectives, constraints, evaluation
 * criteria and decomposed sub-problems. Skills are normalized to the platform
 * taxonomy so the recommendation engine can match them exactly.
 */
export const analyzeChallenge = internalAction({
  args: {
    title: v.string(),
    problemStatement: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (_ctx, { title, problemStatement, context }) => {
    const system = [
      "You are Udbhava AI, the challenge-analysis engine of an innovation platform that connects universities, industry and students.",
      "You convert a raw real-world problem statement into structured JSON for a challenge listing.",
      "Rules:",
      "- Respond with ONLY a valid JSON object, no markdown, no commentary.",
      "- Skills MUST be chosen from this canonical list: " + SKILLS.join(", ") + ".",
      "- domain MUST be one of: Sustainability, Food Systems, Healthcare, Education, Agriculture, Smart Cities, Water & Sanitation, Energy, Mobility, FinTech, Social Impact, Accessibility.",
      "- difficulty MUST be one of: Beginner, Intermediate, Advanced.",
      "- Produce 3-4 sub-problems. Each needs title, description (1-2 sentences), whyItMatters (1 sentence), direction (a concrete technical approach, 1-2 sentences) and skills (2-4 canonical skills).",
      "- summary: 2 sentences on the innovation opportunity.",
    ].join("\n");

    const user = [
      `Challenge title: ${title}`,
      `Problem statement: ${problemStatement}`,
      context ? `Additional context: ${context}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const result = await vly.ai.completion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      maxTokens: 1600,
    });

    if (!result.success || !result.data) {
      throw new Error(result.error ?? "Udbhava AI failed to analyze this challenge.");
    }

    const content = result.data.choices?.[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(content));
    } catch {
      throw new Error(
        "Udbhava AI returned an unreadable analysis. Please try again.",
      );
    }
    return normalize(parsed);
  },
});

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return text;
  return text.slice(start, end + 1);
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((s) => s.trim());
}

function pickList(v: unknown, allowed: readonly string[]): string {
  if (typeof v !== "string") return "";
  const found = allowed.find((a) => a.toLowerCase() === v.trim().toLowerCase());
  return found ?? "";
}

function normalize(raw: unknown): ChallengeAnalysis {
  const r = (raw ?? {}) as Record<string, unknown>;
  const domains = [
    "Sustainability", "Food Systems", "Healthcare", "Education",
    "Agriculture", "Smart Cities", "Water & Sanitation", "Energy",
    "Mobility", "FinTech", "Social Impact", "Accessibility",
  ];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const skills = SKILLS as readonly string[];

  const subProblemsRaw = Array.isArray(r.subProblems) ? r.subProblems : [];
  const subProblems: SubProblem[] = subProblemsRaw
    .slice(0, 4)
    .map((sp) => {
      const o = (sp ?? {}) as Record<string, unknown>;
      return {
        title: String(o.title ?? "Sub-problem").slice(0, 80),
        description: String(o.description ?? "").slice(0, 400),
        whyItMatters: String(o.whyItMatters ?? "").slice(0, 300),
        direction: String(o.direction ?? "").slice(0, 400),
        skills: strArray(o.skills)
          .map((s) => skills.find((c) => c.toLowerCase() === s.toLowerCase()) ?? s)
          .slice(0, 4),
      };
    })
    .filter((sp) => sp.title.length > 0);

  return {
    domain: pickList(r.domain, domains) || "Social Impact",
    difficulty: pickList(r.difficulty, difficulties) || "Intermediate",
    requiredSkills: strArray(r.requiredSkills)
      .map((s) => skills.find((c) => c.toLowerCase() === s.toLowerCase()) ?? s)
      .slice(0, 6),
    preferredSkills: strArray(r.preferredSkills).slice(0, 6),
    objectives: strArray(r.objectives).slice(0, 5),
    constraints: strArray(r.constraints).slice(0, 5),
    evaluationCriteria: strArray(r.evaluationCriteria).slice(0, 5),
    subProblems,
    summary: String(r.summary ?? "").slice(0, 500),
  };
}
