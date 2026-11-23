import { describe, expect, it } from "vitest";
import type { ContentItem } from "@ai-york/contracts";
import { catalogDescription, isProgram, programLevel, programsForPage, trainingActivities } from "../src/catalog";

const item = (id: string, data: Record<string, unknown>): ContentItem => ({
  id, collection: "training", title: "Resource", status: "published", origin: "base", data
});

describe("training and program classification", () => {
  it("uses explicit activities in preference to legacy tags", () => {
    expect(trainingActivities(item("resource-ai-research-workshops", { tags: ["study"], activities: ["work"] }))).toEqual(["work"]);
    expect(trainingActivities(item("resource-ai-research-workshops", { tags: ["study"] }))).toEqual(["study", "research"]);
  });

  it("recognizes programs while preserving unknown and editor-selected levels", () => {
    const master = item("pathway-credentials-master-of-management-in-ai", { tags: ["partner"] });
    expect(isProgram(master)).toBe(true);
    expect(programLevel(master)).toBe("graduate");
    expect(programLevel(item(master.id, { tags: ["partner"], programLevel: "unspecified" }))).toBe("unspecified");
    expect(programLevel(item("other", { tags: ["partner"] }))).toBe("unspecified");
    expect(isProgram(item("course", { tags: ["study"] }))).toBe(false);
  });

  it("adds descriptions to legacy resources without replacing workspace copy", () => {
    const id = "pathway-credentials-master-of-management-in-ai";
    expect(catalogDescription(item(id, {}))).toContain("graduate program");
    expect(catalogDescription(item(id, { summary: "Editor copy" }))).toBe("Editor copy");
    expect(catalogDescription({ ...item(id, {}), origin: "workspace" })).toBe("");
  });

  it("includes the sourced undergraduate program without duplicating matching published entries", () => {
    expect(programsForPage([]).filter((resource) => programLevel(resource) === "undergraduate")).toHaveLength(1);
    const existing = item("published", { tags: ["partner"], url: "https://lassonde.yorku.ca/academics/computer-science/" });
    expect(programsForPage([existing])).toEqual([existing]);
  });
});
