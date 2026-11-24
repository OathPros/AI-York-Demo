import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DemoBanner } from "../src/demo-banner";
import { News } from "../src/updates";

describe("demo presentation", () => {
  it("keeps the disclosure visible when workspace actions are absent", () => {
    const markup = renderToStaticMarkup(<DemoBanner />);
    expect(markup).toContain('role="note"');
    expect(markup).toContain("Demonstration website. Some content, activities and records are illustrative and do not represent official York University guidance.");
    expect(markup).not.toContain("Open Studio");
  });

  it("links news cards to their actual York stories", () => {
    const markup = renderToStaticMarkup(<News />);
    expect(markup).toContain("https://www.yorku.ca/yfile/2026/09/09/york-professor-explores-how-ai-can-deepen-learning-in-the-classroom/");
    expect(markup).not.toContain("Demo stories");
    expect((markup.match(/<option>YFile<\/option>/g) ?? [])).toHaveLength(1);
  });
});
