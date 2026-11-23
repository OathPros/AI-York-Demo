import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GroupCards, GroupPage } from "../src/governance-groups";

describe("governance groups", () => {
  it.each([
    ["roundtables", ["AI Roundtable"]],
    ["working-groups", ["Student and Administrative Services", "Teaching and Learning", "Research AI Working Group"]],
    ["community", ["Data and Analytics Community of Engagement", "Student Services Generative AI", "Administrative Employees"]]
  ] as const)("shows each %s group as an overview card", (section, names) => {
    const markup = renderToStaticMarkup(<GroupCards section={section} open={() => {}} />);
    expect((markup.match(/aria-haspopup="dialog"/g) ?? [])).toHaveLength(names.length);
    names.forEach((name) => expect(markup).toContain(name));
  });

  it("shows members while keeping the working-group term under discussion", () => {
    const markup = renderToStaticMarkup(<GroupPage id="research" onRequestJoin={() => {}} />);
    expect(markup).toContain("future term and mandate are under discussion");
    expect(markup).toContain("Frodo Baggins");
    expect(markup).toContain("Request to join");
  });

  it("links the student-services community to its official join page", () => {
    const markup = renderToStaticMarkup(<GroupPage id="student-services-genai" onRequestJoin={() => {}} />);
    expect(markup).toContain("Nick Valentino, Co-Chair");
    expect(markup).toContain("Luke Gagliardi, Co-Chair");
    expect(markup).toContain('href="https://www.yorku.ca/uit/pmo/cop-gen-ai/"');
    expect(markup).toContain("Join this community");
    expect(markup).toContain("Samwise Gamgee");
  });

  it("shows the data community chair and members", () => {
    const markup = renderToStaticMarkup(<GroupPage id="data-analytics" onRequestJoin={() => {}} />);
    expect(markup).toContain("Patrick Cernea, Chair (OIPA)");
    expect(markup).toContain("Rosie Cotton");
  });

  it("handles unknown group links without showing another group", () => {
    const markup = renderToStaticMarkup(<GroupPage id="does-not-exist" onRequestJoin={() => {}} />);
    expect(markup).toContain("Group not found");
    expect(markup).not.toContain("Request to join");
  });
});
