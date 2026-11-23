import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { contentCollections, type ContentBundle } from "@ai-york/contracts";
import { describe, expect, it } from "vitest";
import { GovernancePage } from "../src/policies-reports";

describe("policy and community layout", () => {
  it("places the roundtable and policy before group cards and reports", () => {
    const content = Object.fromEntries(contentCollections.map((name) => [name, []])) as unknown as ContentBundle;
    const markup = renderToStaticMarkup(<GovernancePage content={content} />);
    const positions = ["roundtables", "policy", "working-groups", "community", "reports"]
      .map((section) => markup.indexOf(`id="governance-${section}"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(markup).toContain('title="AI policy document"');
    expect(markup).toContain("policy-studio.html?view=public");
    expect(markup).toContain("compact=1");
    expect(markup).toContain("Open full policy");
    expect(markup).not.toContain("not approved York policy");
    expect((markup.match(/class="document-card group-card"/g) ?? [])).toHaveLength(7);
  });
});
