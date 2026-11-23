import { activitySchema, type Activity, type ContentItem } from "@ai-york/contracts";

export type ProgramLevel = "undergraduate" | "graduate" | "certificate" | "unspecified";

const legacyResearch = new Set(["resource-ai-research-workshops", "resource-using-genai-for-research"]);
const legacyLevels: Record<string, ProgramLevel> = {
  "pathway-credentials-master-of-management-in-ai": "graduate",
  "pathway-credentials-certificate-in-ai-governance": "certificate"
};

export function isProgram(item: ContentItem): boolean {
  return Array.isArray(item.data.tags) && item.data.tags.includes("partner");
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
