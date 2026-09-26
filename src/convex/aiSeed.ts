"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { SKILLS, DOMAINS, DIFFICULTIES } from "../lib/constants";

interface DemoChallenge {
  title: string;
  problemStatement: string;
  context: string;
}

const DEMO: DemoChallenge[] = [
  {
    title: "Reduce Food Waste in University Cafeterias",
    problemStatement:
      "University cafeterias frequently over-prepare food because daily demand is difficult to predict. This leads to unnecessary food waste while students sometimes experience shortages of popular items. Mess committees track leftovers on paper, so patterns are discovered too late to change purchasing or preparation decisions.",
    context:
      "A single campus kitchen serves 2,000+ meals a day across 4 service windows. Leftover food cannot be redistributed without tracking. The university sustainability office wants measurable waste reduction within one semester.",
  },
  {
    title: "Affordable Water Quality Monitoring for Rural Borewells",
    problemStatement:
      "Rural households depend on borewells whose water quality drifts seasonally and after floods. Lab testing is slow and costly, so contamination is usually discovered only after people fall ill. Villages need a low-cost way to continuously monitor basic water quality indicators and raise early alerts.",
    context:
      "Partner NGO runs 40 villages with community borewells. Each site has intermittent mobile connectivity and no mains power at the pump.",
  },
  {
    title: "Early Screening Assistant for Learning Difficulties in Primary Schools",
    problemStatement:
      "Teachers in under-resourced primary schools have no structured way to flag early signs of dyslexia and other learning difficulties. Screening today is a yearly paper checklist processed months later, so children miss the early-intervention window where support is most effective.",
    context:
      "A state school board wants a tool usable by non-specialist teachers on shared tablets, working fully offline during school hours.",
  },
];

/**
 * One-time demo seed:
 * 1. ensure the demo organization account exists
 * 2. AI-analyze three realistic challenges (with local fallback)
 * 3. insert them under that organization
 */
export const seedDemoChallenges = internalAction({
  args: {},
  handler: async (ctx) => {
    const org = await ctx.runMutation(internal.meta.ensureDemoOrg, {});

    const prepared = [];
    for (const d of DEMO) {
      let analysis;
      try {
        analysis = await ctx.runAction(internal.ai.analyzeChallenge, {
          title: d.title,
          problemStatement: d.problemStatement,
          context: d.context,
        });
      } catch {
        analysis = fallbackAnalysis();
      }
      prepared.push({
        title: d.title,
        problemStatement: d.problemStatement,
        context: d.context,
        domain: analysis.domain,
        difficulty: analysis.difficulty,
        requiredSkills: analysis.requiredSkills,
        preferredSkills: analysis.preferredSkills,
        objectives: analysis.objectives,
        constraints: analysis.constraints,
        evaluationCriteria: analysis.evaluationCriteria,
        subProblems: analysis.subProblems,
        analysisSummary: analysis.summary,
      });
    }

    await ctx.runMutation(internal.meta.insertSeededChallenges, {
      orgUserId: org.orgUserId,
      orgName: org.orgName,
      challenges: prepared,
    });
  },
});

function fallbackAnalysis() {
  const skills = SKILLS as readonly string[];
  return {
    domain: DOMAINS[0] as string,
    difficulty: DIFFICULTIES[1] as string,
    requiredSkills: [skills[0], skills[1], skills[4], skills[10]],
    preferredSkills: [skills[19]] as string[],
    objectives: [
      "Reduce measurable waste within one semester",
      "Give coordinators timely, actionable data",
    ],
    constraints: ["Campus-scale deployment", "Minimal ongoing cost"],
    evaluationCriteria: [
      "Innovation",
      "Feasibility",
      "Social Impact",
      "Scalability",
      "Technical Implementation",
    ],
    subProblems: [
      {
        title: "Demand Prediction",
        description:
          "Predict daily demand from limited historical consumption data.",
        whyItMatters: "Accurate forecasts directly cut over-preparation.",
        direction:
          "Time-series model on past consumption with weekday/seasonality features.",
        skills: [skills[0], skills[1]],
      },
      {
        title: "Simple Data Capture",
        description: "Collect ground-truth data without burdening staff.",
        whyItMatters: "No data, no model.",
        direction: "Mobile-first entry with offline support and validation.",
        skills: [skills[4], skills[5]],
      },
    ],
    summary:
      "A focused, measurable problem where a small predictive and data-capture solution can demonstrate clear impact.",
  };
}
