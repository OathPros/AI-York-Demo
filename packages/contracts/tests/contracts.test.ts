import { describe, expect, it } from "vitest";
import { eventSuggestionSchema, requestSchema, trainingItemSchema } from "../src/index";

describe("change requests", () => {
  const key = "k".repeat(20);
  it("accepts a broken link report", () => {
    const r = requestSchema.safeParse({ kind: "broken_link", idempotencyKey: key, payload: { type: "broken_link", title: "Dead link", pageUrl: "#/tools", brokenUrl: "https://example.com/x", referringPage: "#/" } });
    expect(r.success).toBe(true);
  });

  describe("training and program metadata", () => {
    const base = { title: "AI course", tags: ["study"] };
    it("accepts existing records and explicit research and program classifications", () => {
      expect(trainingItemSchema.safeParse(base).success).toBe(true);
      expect(trainingItemSchema.safeParse({ ...base, activities: ["research"], programLevel: "graduate" }).success).toBe(true);
    });
    it("rejects unknown activity and program level values", () => {
      expect(trainingItemSchema.safeParse({ ...base, activities: ["other"] }).success).toBe(false);
      expect(trainingItemSchema.safeParse({ ...base, programLevel: "doctor" }).success).toBe(false);
    });
  });
  it("rejects a kind that does not match the payload type", () => {
    const r = requestSchema.safeParse({ kind: "event", idempotencyKey: key, payload: { type: "other", title: "Hello", details: "Some details", referringPage: "#/" } });
    expect(r.success).toBe(false);
  });
  it("requires details for a correction", () => {
    const r = requestSchema.safeParse({ kind: "correction", idempotencyKey: key, payload: { type: "correction", title: "Typo", pageUrl: "#/guide", referringPage: "#/" } });
    expect(r.success).toBe(false);
  });
});

describe("event suggestion contract", () => {
  it("requires a real title and date", () => {
    expect(eventSuggestionSchema.safeParse({
      type: "event",
      title: "x",
      date: "tomorrow",
      allDay: true,
      timezone: "America/Toronto",
      organizer: "AI @ York",
      audience: "Students",
      referringPage: "/calendar"
    }).success).toBe(false);
  });
});
