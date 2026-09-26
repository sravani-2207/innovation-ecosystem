/**
 * Mock AI analysis for the interactive prototype. Produces a realistic,
 * challenge-aware assessment of a student's idea — problem understanding,
 * strengths, gaps, suggestions and expected impact — with a short simulated
 * delay so the "analyzing" state reads as intentional.
 */

export interface IdeaAnalysis {
  problemUnderstanding: string;
  strengths: string[];
  missing: string[];
  suggestions: string[];
  expectedImpact: string;
}

interface MockInput {
  ideaTitle: string;
  ideaDescription: string;
  technologies: string[];
  challengeTitle: string;
  problemStatement: string;
  domain: string;
  requiredSkills: string[];
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function detectFocus(description: string, technologies: string[]) {
  const text = `${description} ${technologies.join(" ")}`.toLowerCase();
  return {
    prediction: /predict|forecast|ml|machine|model|time.?series/.test(text),
    sensors: /iot|sensor|device|monitor|telemetry|hardware/.test(text),
    mobile: /mobile|app|android|ios|pwa/.test(text),
    dashboard: /dashboard|analytics|visuali|report|chart/.test(text),
    community: /community|volunteer|awareness|campaign|training/.test(text),
  };
}

export async function generateMockAnalysis(
  input: MockInput,
): Promise<IdeaAnalysis> {
  await wait(2200); // simulated thinking time

  const {
    ideaTitle,
    ideaDescription,
    technologies,
    challengeTitle,
    problemStatement,
    domain,
    requiredSkills,
  } = input;

  const focus = detectFocus(ideaDescription, technologies);
  const covered = technologies.map((t) => t.toLowerCase());

  // Problem understanding: reflect the actual challenge text.
  const problemUnderstanding = `“${ideaTitle}” addresses the core of “${challengeTitle}”: ${problemStatement
    .split(/(?<=[.!?])\s/)
    .slice(0, 2)
    .join(" ")} The idea positions itself in the ${domain.toLowerCase()} space${
    focus.prediction
      ? " with a data-driven prediction component at its center"
      : focus.sensors
        ? " by instrumenting the physical environment directly"
        : ""
  }, which is the right entry point for this problem.`;

  // Strengths: grounded in what the student actually wrote.
  const strengths: string[] = [];
  if (focus.prediction)
    strengths.push(
      "A prediction-first approach attacks the root cause (over-estimation) rather than just cleaning up afterwards.",
    );
  if (focus.sensors)
    strengths.push(
      "Direct sensing produces ground-truth data, which makes every later decision measurable instead of anecdotal.",
    );
  if (focus.dashboard)
    strengths.push(
      "A visibility layer turns raw numbers into decisions coordinators can act on during the day, not after the semester.",
    );
  if (focus.community)
    strengths.push(
      "Involving the community creates adoption pull — the hardest part of any deployment — from day one.",
    );
  if (covered.some((t) => requiredSkills.some((r) => r.toLowerCase() === t)))
    strengths.push(
      `The chosen stack (${technologies.slice(0, 3).join(", ")}) aligns with the challenge's stated skill requirements.`,
    );
  if (strengths.length === 0)
    strengths.push(
      "The idea is scoped tightly enough to be demonstrable within a semester — a strength most first drafts lack.",
    );

  // Missing: what the description does NOT cover.
  const missing: string[] = [];
  if (!focus.prediction && requiredSkills.some((r) => /ml|data|analytics/i.test(r)))
    missing.push(
      "No quantitative component yet — the challenge expects data-driven decisions, and right now the idea would rely on manual observation.",
    );
  if (!focus.sensors && requiredSkills.some((r) => /iot|hardware|embedded/i.test(r)))
    missing.push(
      "There is no plan for collecting real-world data; without it, the solution cannot prove impact.",
    );
  if (!focus.dashboard)
    missing.push(
      "Nothing in the description addresses how users will see and act on the results day to day.",
    );
  if (!/data|dataset|collect|source/i.test(ideaDescription))
    missing.push(
      "Data sourcing is unaddressed: what data exists, who owns it, and how it will flow into the system.",
    );
  if (!/privacy|consent|security/i.test(ideaDescription))
    missing.push(
      "No mention of data privacy or access control — usually a prerequisite before any pilot is approved.",
    );
  if (missing.length === 0)
    missing.push(
      "The main gap is validation: define one concrete metric and a measurement window so success is provable.",
    );

  // Suggestions: concrete next moves tied to the gaps.
  const suggestions: string[] = [];
  if (missing.some((m) => m.includes("quantitative")))
    suggestions.push(
      "Start with a simple weekly-consumption baseline (even a spreadsheet model) before any ML — it makes the improvement measurable.",
    );
  if (missing.some((m) => m.includes("real-world data")))
    suggestions.push(
      "Add one lightweight capture touchpoint (a form or cheap sensor) and run it for two weeks to seed the dataset.",
    );
  if (missing.some((m) => m.includes("see and act")))
    suggestions.push(
      "Sketch a single daily view: today's numbers, yesterday's, and one recommended action. Resist building a full dashboard first.",
    );
  if (missing.some((m) => m.includes("Data sourcing")))
    suggestions.push(
      "Name the data owner and the collection cadence in one paragraph — it converts the idea from concept to plan.",
    );
  if (missing.some((m) => m.includes("privacy")))
    suggestions.push(
      "Add a short data-handling note: what is stored, who can see it, and how long it is kept.",
    );
  suggestions.push(
    `Frame the outcome as a measurable target, e.g. “reduce ${domain.toLowerCase()}-related waste by 20% within one semester” — evaluators reward specificity.`,
  );

  const expectedImpact = `If executed, ${ideaTitle} gives the organization a repeatable way to see and act on the problem instead of relying on periodic manual review. ${
    focus.prediction
      ? "The prediction layer compounds in value as data accumulates, so the pilot itself becomes the foundation for a production system. "
      : ""
  }Within one semester this should translate into a working pilot, one clear before/after metric, and a decision from the organization on whether to scale it.`;

  return { problemUnderstanding, strengths, missing, suggestions, expectedImpact };
}
