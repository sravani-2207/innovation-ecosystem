/**
 * Deterministic semantic-ish matching used by Udbhava AI recommendations.
 *
 * Real embeddings need pgvector + an embedding API; for v1 we approximate
 * semantic similarity with a stable character-hashing embedding. It is
 * deterministic (same input → same score) and dependency-free, and the
 * structured parts of the score (skills, domain, difficulty) carry most of
 * the weight, exactly like the real recommendation engine would.
 */

const DIMS = 24;

function hashChar(code: number, seed: number): number {
  let x = (2166136261 ^ seed) >>> 0;
  x = Math.imul(x ^ code, 16777619) >>> 0;
  return x;
}

/** Deterministic pseudo-embedding of a text string. */
export function embed(text: string, dims = DIMS): number[] {
  const vec = new Array<number>(dims).fill(0);
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    for (let i = 0; i < token.length; i++) {
      const bigram = token.slice(i, i + 2);
      let h = 0;
      for (let j = 0; j < bigram.length; j++) {
        h = hashChar(bigram.charCodeAt(j), h + j * 31);
      }
      vec[h % dims] += 1;
    }
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) dot += a[i] * b[i];
  return dot;
}

function eq(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export interface MatchStudent {
  skills: string[];
  interests: string[];
  experienceLevel?: string;
  location?: string;
  availability?: string;
}

export interface MatchChallenge {
  title: string;
  problemStatement: string;
  domain: string;
  difficulty: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  location?: string;
  availability?: string;
}

export interface MatchResult {
  score: number;
  matched: string[];
  missing: string[];
  notes: string[];
}

/**
 * Score how well a student fits a challenge (0–97). Skills weigh most,
 * then domain interest, then text similarity, difficulty fit and logistics.
 */
export function scoreMatch(
  student: MatchStudent,
  challenge: MatchChallenge,
): MatchResult {
  const studentSkills = student.skills.map((s) => s.toLowerCase().trim());
  const required = challenge.requiredSkills.map((s) => s.trim());
  const preferred = (challenge.preferredSkills ?? []).map((s) => s.trim());

  const matchedRequired = required.filter((r) =>
    studentSkills.includes(r.toLowerCase()),
  );
  const missingRequired = required.filter(
    (r) => !studentSkills.includes(r.toLowerCase()),
  );
  const matchedPreferred = preferred.filter((r) =>
    studentSkills.includes(r.toLowerCase()),
  );

  const skillRatio =
    required.length === 0
      ? 0.6
      : matchedRequired.length / required.length;

  const interests = student.interests.map((s) => s.toLowerCase().trim());
  const domainHit =
    interests.includes(challenge.domain.toLowerCase()) ||
    interests.some((i) => challenge.domain.toLowerCase().includes(i));
  const interestOverlap = interests.filter((i) =>
    challenge.title.toLowerCase().includes(i) ||
    challenge.problemStatement.toLowerCase().includes(i),
  ).length;

  const semantic =
    cosine(
      embed(`${challenge.title} ${challenge.problemStatement} ${challenge.domain}`),
      embed(
        `${student.skills.join(" ")} ${student.interests.join(" ")} ${
          student.experienceLevel ?? ""
        }`,
      ),
    ) / 0.6; // these embeddings overlap generously; rescale

  const diffFit = student.experienceLevel
    ? eq(student.experienceLevel, challenge.difficulty)
      ? 1
      : 0.4
    : 0.6;

  const logistics =
    (challenge.location && student.location &&
      eq(challenge.location, student.location)) ||
    (challenge.availability && student.availability &&
      challenge.availability === student.availability)
      ? 1
      : 0.55;

  const raw =
    0.45 * skillRatio +
    0.18 * (domainHit ? 1 : 0.35) +
    0.15 * Math.min(1, Math.max(0, semantic)) +
    0.12 * diffFit +
    0.06 * logistics +
    0.04 * Math.min(1, interestOverlap * 0.5);

  const score = Math.min(97, Math.max(31, Math.round(raw * 100)));

  const notes: string[] = [];
  if (domainHit) notes.push(`${challenge.domain} interest`);
  if (matchedPreferred.length > 0)
    notes.push(`${matchedPreferred.join(", ")} (preferred)`);
  if (diffFit === 1) notes.push(`${challenge.difficulty} difficulty fit`);

  return {
    score,
    matched: matchedRequired,
    missing: missingRequired,
    notes,
  };
}
