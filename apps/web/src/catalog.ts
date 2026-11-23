import { activitySchema, type Activity, type ContentItem } from "@ai-york/contracts";

export type ProgramLevel = "undergraduate" | "graduate" | "certificate" | "unspecified";

const legacyResearch = new Set(["resource-ai-research-workshops", "resource-using-genai-for-research"]);
const legacyLevels: Record<string, ProgramLevel> = {
  "pathway-credentials-master-of-management-in-ai": "graduate",
  "pathway-credentials-certificate-in-ai-governance": "certificate"
};
const legacyDescriptions: Record<string, string> = {
  "pathway-admin-genai-at-york-learning-package": "Build practical skills with York's generative AI learning package, including resources for workplace tools and workflows.",
  "pathway-admin-genai-for-people-managers": "Explore how managers can support responsible AI use and guide conversations within their teams.",
  "pathway-admin-explore-genai-sessions-in-yu-learn": "Browse upcoming learning opportunities and sessions available through YU Learn.",
  "pathway-academic-ai-pedagogy-courses-workshops": "Explore Teaching Commons courses, workshops and resources for teaching and learning with AI.",
  "pathway-academic-self-paced-genai-teaching-course": "Work through a self-paced course on AI literacy, course expectations, assessment and teaching strategies.",
  "pathway-academic-certificates-in-ai-pedagogies": "Develop your practice through Teaching Commons certificates in AI pedagogies.",
  "pathway-credentials-master-of-management-in-ai": "Combine applied AI knowledge with business and management skills in Schulich's graduate program.",
  "pathway-credentials-certificate-in-ai-governance": "Develop practical skills in AI oversight, risk management and governance through continuing education.",
  "pathway-credentials-explore-ai-related-degree-programs": "Explore York programs connected to artificial intelligence, computing and data."
};

const undergraduateProgram: ContentItem = {
  id: "curated-computer-science", collection: "training", title: "Computer Science (BA / BSc)", status: "published", origin: "base",
  data: {
    title: "Computer Science (BA / BSc)",
    summary: "Build a foundation in computing and explore AI through projects and upper-year courses at the Lassonde School of Engineering.",
    url: "https://lassonde.yorku.ca/academics/computer-science",
    format: "Undergraduate degree", tags: ["partner", "study"], activities: ["study"], programLevel: "undergraduate"
  }
};

export function isProgram(item: ContentItem): boolean {
  return Array.isArray(item.data.tags) && item.data.tags.includes("partner");
}

export function catalogDescription(item: ContentItem): string {
  return item.data.summary || (item.origin === "base" ? legacyDescriptions[item.id] : "") || "";
}

export function programsForPage(training: ContentItem[]): ContentItem[] {
  const programs = training.filter(isProgram);
  const canonical = (url: unknown) => typeof url === "string" ? url.replace(/\/+$/, "").toLowerCase() : "";
  return programs.some((item) => canonical(item.data.url) === canonical(undergraduateProgram.data.url))
    ? programs : [...programs, undergraduateProgram];
}

export function trainingActivities(item: ContentItem): Activity[] {
  if (Array.isArray(item.data.activities)) {
    return item.data.activities.filter((value: unknown): value is Activity => activitySchema.safeParse(value).success);
  }
  const tags: string[] = Array.isArray(item.data.tags) ? item.data.tags : [];
  return (["study", "work", "research", "teach"] as const).filter((activity) =>
    tags.includes(activity) || (activity === "research" && legacyResearch.has(item.id))
  );
}

export function programLevel(item: ContentItem): ProgramLevel {
  const level: unknown = item.data.programLevel;
  if (level === "undergraduate" || level === "graduate" || level === "certificate" || level === "unspecified") return level;
  return legacyLevels[item.id] ?? "unspecified";
}
