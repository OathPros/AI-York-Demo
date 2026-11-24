import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuidancePage } from "../src/information-architecture";
import { guidanceSelection } from "../src/audience-guides";

describe("contextual guidance", () => {
  it("shows an unselected starting view with useful, shareable paths to each activity", () => {
    const page = renderToStaticMarkup(<GuidancePage copies={{}} />);
    expect(page).not.toContain('aria-pressed="true"');
    expect(page).toContain("Start with your work");
    expect(page).toContain("Course rules and citation");
    expect(page).toContain("Ethics and data approvals");
    expect(page).toContain('href="#/guidance?activity=study"');
  });

  it.each([
    ["study", "Course rules and citation", "Ethics and data approvals"],
    ["teach", "Course expectations and assessment", "Handle York information"],
    ["research", "Ethics and data approvals", "Course rules and citation"],
    ["work", "Handle York information", "Course expectations and assessment"]
  ] as const)("shows only the %s context's guidance", (activity, included, excluded) => {
    const page = renderToStaticMarkup(<GuidancePage activity={activity} copies={{}} />);
    expect(page.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(page).toContain(included);
    expect(page).not.toContain(excluded);
    expect(page).toContain(`href="#/guide?activity=${activity}"`);
  });

  it.each([
    ["teach,research", ["Course expectations and assessment", "Ethics and data approvals"]],
    ["research,work", ["Ethics and data approvals", "Handle York information"]],
    ["study,teach,research", ["Course rules and citation", "Course expectations and assessment", "Ethics and data approvals"]]
  ])("composes guidance for %s and preserves the selection in the Finder link", (value, topics) => {
    const activities = guidanceSelection(new URLSearchParams(`activities=${value},invalid`));
    const page = renderToStaticMarkup(<GuidancePage copies={{}} activities={activities} />);
    for (const topic of topics) expect(page).toContain(topic);
    expect(page.match(/Selected activities/g)).toHaveLength(1);
    expect(page).toContain(`href="#/guide?activities=${value}"`);
  });

  it("puts activity controls in the hero and omits the empty selection prompt", () => {
    const page = renderToStaticMarkup(<GuidancePage copies={{}} activities={[]} />);
    const hero = page.split("</header>")[0];
    expect(hero).toContain("context-controls");
    expect(hero).not.toContain("Check a task");
    expect(page).not.toContain("Select an activity to see relevant guidance");
  });

  it("uses the Studio-published title and introduction for the selected context", () => {
    const page = renderToStaticMarkup(<GuidancePage activity="research" copies={{ research: { title: "Published title", intro: "Published introduction" } }} />);
    expect(page).toMatch(/<h1[^>]*>Published title<\/h1>/);
    expect(page).toContain("Published introduction");
    expect(page).toContain("https://researchguides.library.yorku.ca/genairesearch");
  });
});
