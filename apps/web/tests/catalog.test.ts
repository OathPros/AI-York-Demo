import { describe, expect, it } from "vitest";
import type { ContentItem } from "@ai-york/contracts";
import { isProgram, programLevel, trainingActivities } from "../src/catalog";

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
});
