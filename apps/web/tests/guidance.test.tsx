import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuidancePage } from "../src/information-architecture";

describe("contextual guidance", () => {
  it("shows study guidance by default with a selected, shareable context", () => {
    const page = renderToStaticMarkup(<GuidancePage copies={{}} />);
    expect(page).toContain('href="#/guidance?activity=study" aria-current="page"');
    expect(page).toContain("Course rules and citation");
    expect(page).not.toContain("Ethics and data approvals");
    expect(page).toContain('href="#/guide?activity=study"');
  });

  it.each([
    ["study", "Course rules and citation", "Ethics and data approvals"],
    ["teach", "Course expectations and assessment", "Handle York information"],
    ["research", "Ethics and data approvals", "Course rules and citation"],
    ["work", "Handle York information", "Course expectations and assessment"]
  ] as const)("shows only the %s context's guidance", (activity, included, excluded) => {
    const page = renderToStaticMarkup(<GuidancePage activity={activity} copies={{}} />);
    expect(page).toContain(`href="#/guidance?activity=${activity}" aria-current="page"`);
    expect(page).toContain(included);
    expect(page).not.toContain(excluded);
    expect(page).toContain(`href="#/guide?activity=${activity}"`);
  });

  it("uses the Studio-published title and introduction for the selected context", () => {
    const page = renderToStaticMarkup(<GuidancePage activity="research" copies={{ research: { title: "Published title", intro: "Published introduction" } }} />);
    expect(page).toContain("<h1>Published title</h1>");
    expect(page).toContain("Published introduction");
    expect(page).toContain("https://researchguides.library.yorku.ca/genairesearch");
  });
});
