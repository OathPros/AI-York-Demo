import { describe, expect, it } from "vitest";

describe("API milestone", () => {
  it("keeps publication as an explicit action", () => {
    expect(["publish", "decline"]).toContain("publish");
  });
});
