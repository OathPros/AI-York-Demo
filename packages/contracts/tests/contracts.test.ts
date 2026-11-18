import { describe, expect, it } from "vitest";
import { eventSuggestionSchema } from "../src/index";

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
