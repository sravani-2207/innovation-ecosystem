/**
 * Skill / interest / domain taxonomies shared by the Convex backend and the
 * React client. The AI analyzer is instructed to prefer these canonical names.
 */

export const SKILLS = [
  "Python",
  "Machine Learning",
  "Data Science",
  "Data Analytics",
  "Backend",
  "Frontend",
  "React",
  "UI/UX",
  "Mobile Development",
  "IoT",
  "Embedded Systems",
  "Cloud",
  "DevOps",
  "Cybersecurity",
  "Robotics",
  "Computer Vision",
  "NLP",
  "Blockchain",
  "AR/VR",
  "GIS",
  "Product Management",
  "Hardware Prototyping",
] as const;

export const INTERESTS = [
  "Healthcare",
  "Sustainability",
  "Education",
  "Agriculture",
  "Smart Cities",
  "FinTech",
  "Social Impact",
  "Food Systems",
  "Water & Sanitation",
  "Energy",
  "Mobility",
  "Accessibility",
  "Waste Management",
  "Climate",
] as const;

export const DOMAINS = [
  "Sustainability",
  "Food Systems",
  "Healthcare",
  "Education",
  "Agriculture",
  "Smart Cities",
  "Water & Sanitation",
  "Energy",
  "Mobility",
  "FinTech",
  "Social Impact",
  "Accessibility",
] as const;

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
] as const;

export const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
] as const;

export const AVAILABILITY = [
  "5–10 hrs / week",
  "10–15 hrs / week",
  "15–25 hrs / week",
  "Full-time",
] as const;

/** Friendly one-line status labels for the challenge lifecycle. */
export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  open_for_participation: "Open for Participation",
  team_formation: "Team Formation",
  development: "Solution Development",
  submission_open: "Submission Open",
  evaluation: "Evaluation",
  improvement: "Improvement",
  completed: "Completed",
  showcased: "Showcased",
  archived: "Archived",
};
