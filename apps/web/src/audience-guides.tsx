import React from "react";
import type { Activity, ContentBundle } from "@ai-york/contracts";
import { guides, guidanceTopics } from "./guidance-content";
import { GuideFinder } from "./hub";
import { pageCopy, type PublishedPages } from "./page-copy";
import "./audience-guides.css";

const labels: Record<Activity, string> = { study: "Study", teach: "Teach", research: "Research", work: "Work" };
const contexts = Object.keys(labels) as Activity[];

export function guidanceSelection(params: URLSearchParams): Activity[] {
  const requested = [...params.getAll("activity"), ...params.getAll("activities")].flatMap((value) => value.split(","));
  return contexts.filter((context) => requested.includes(context));
}

function contextHref(page: "guidance" | "guide" | "training" | "tools", selection: readonly Activity[]) {
  const value = contexts.filter((context) => selection.includes(context));
  if (value.length === 0) return `#/${page}`;
  return `#/${page}?${value.length === 1 ? "activity" : "activities"}=${value.join(",")}`;
}

const stages = [
  { title: "Check what applies", intro: "Find the expectations and approvals that govern the work and the information involved.", topics: ["coursework", "assessment", "approvals", "decide", "data", "graduate", "supervision", "funding"] },
  { title: "Plan the task", intro: "Explore concrete ways to work, and what to review before using the output.", topics: ["practice", "classroom", "preparation", "methods"] },
  { title: "Find tools and support", intro: "Check access requirements and find support for the activity you are working on.", topics: ["access", "training", "community"] }
];

const overlappingTasks: { activities: Activity[]; title: string; example: string }[] = [
  { activities: ["research", "work"], title: "Summarize a meeting or analyze data", example: "A project meeting may include research participant information and internal York updates. Check the approved research workflow and data agreements for the research material, then check York information handling and meeting assistant requirements for the administrative work." },
  { activities: ["teach", "research"], title: "Turn a research example into teaching material", example: "Before bringing research material into a class, check the research permissions and the information involved. For the teaching activity, check accessibility, course expectations and how you will explain any use of AI." },
  { activities: ["study", "teach", "research"], title: "Work across a course, a thesis and a teaching assignment", example: "Keep the expectations for your own assessed work, your thesis workflow and the materials you prepare for students distinct. Check the course instructions, discuss thesis use with your supervisor and review the teaching and research requirements that apply to the material." }
];

export function GuidancePage({ activity, activities, copies, content }: {
  activity?: Activity; activities?: Activity[]; copies: PublishedPages; content?: ContentBundle;
}) {
  const selected = activities ?? [activity ?? "study"];
  const single = selected.length === 1 ? selected[0] : undefined;
  const copy = single ? copies[single] ?? pageCopy[single] : undefined;
  const examples = overlappingTasks.filter((example) => example.activities.every((activity) => selected.includes(activity)));
  const topics = guidanceTopics.filter((topic) => selected.includes(topic.activity));
  const sources = new Map<string, string>();
  for (const topic of topics) {
    for (const [label, href] of topic.links ?? []) if (!sources.has(href)) sources.set(href, label);
  }

  function jumpToFinder() {
    const target = document.getElementById("guide-title");
    target?.setAttribute("tabindex", "-1");
    target?.focus();
    target?.scrollIntoView({ block: "start" });
  }

  return <div className="guidance-page">
    <header className="guidance-hero shell">
      <div>
        <p className="eyebrow">AI @ York / Guidance</p>
        <h1>{copy?.title ?? "AI guidance for your activities"}</h1>
        <p className="lead">{copy?.intro ?? "Find the requirements, examples and tools that apply across the work you do at York."}</p>
        {content ? <button type="button" className="primary" onClick={jumpToFinder}>Check a task <span aria-hidden="true">↓</span></button> :
          <a className="button primary" href={contextHref("guide", selected)}>Check a task</a>}
      </div>
      <img src={guides[single ?? "research"].image} alt="" />
    </header>

    <div className="guidance-context">
      <div className="shell">
        <div><h2 id="activity-picker">What are you doing with AI?</h2><p>Choose the activities you want guidance for. You can combine them.</p></div>
        <div className="context-controls" role="group" aria-labelledby="activity-picker">
          {contexts.map((context) => {
            const active = selected.includes(context);
            const next = active ? selected.filter((value) => value !== context) : [...selected, context];
            const href = next.length ? contextHref("guidance", next) : "#/guidance?activities=";
            return <button key={context} type="button" aria-pressed={active} onClick={() => { window.location.hash = href; }}>
              <span aria-hidden="true">{active ? "✓" : "+"}</span>{labels[context]}
            </button>;
          })}
        </div>
      </div>
    </div>
    <div className="shell guidance-reading">
      <div className="guidance-main">
        {selected.length ? <>
          <section className="guidance-overview">
            <h2>Start with the task and the information</h2>
            <p>Check what you can share, which rules apply to this task and how you will review the output. When activities overlap, check the requirements for each one.</p>
            {!single && selected.map((activity) => <p key={activity}><strong>{(copies[activity] ?? pageCopy[activity]).title}</strong> · {(copies[activity] ?? pageCopy[activity]).intro}</p>)}
          </section>
          {examples.length > 0 && <section className="guidance-examples" aria-labelledby="guidance-examples-title">
            <h2 id="guidance-examples-title">When activities overlap</h2>
            {examples.map(({ title, example }) => <div key={title}><h3>{title}</h3><p>{example}</p></div>)}
            {content && <button className="text-button" type="button" onClick={jumpToFinder}>Check the task and information type ↓</button>}
          </section>}
          {stages.map((stage) => {
            const sections = stage.topics.flatMap((id) => topics.filter((topic) => topic.id === id));
            return sections.length > 0 && <section className="guidance-stage" key={stage.title}>
              <h2>{stage.title}</h2><p>{stage.intro}</p>
              {sections.map((topic) => <details key={topic.id}>
                <summary><span className="guidance-context-label">{labels[topic.activity]}</span><strong>{topic.title}</strong></summary>
                <div className="guidance-detail">
                  {topic.items.map(([heading, text]) => <div key={heading}><h3>{heading}</h3><p>{text}</p></div>)}
                  {topic.example && <aside><h3>{topic.example[0]}</h3><p>{topic.example[1]}</p></aside>}
                  {topic.links && <ul>{topic.links.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>}
                </div>
              </details>)}
            </section>;
          })}
        </> : <p role="status">Select an activity to see relevant guidance and tasks.</p>}
      </div>
      <aside className="guidance-resources" aria-labelledby="guidance-resources-title">
        <h2 id="guidance-resources-title">Tools and references</h2>
        <ul>
          <li><a href={contextHref("tools", selected)}>Compare York tools and access</a></li>
          <li><a href={contextHref("training", selected)}>Find training</a></li>
          <li><a href="#/governance">Explore policy and community</a></li>
        </ul>
        {sources.size > 0 && <details><summary>All sources and related resources</summary>
          <ul>{[...sources].map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
        </details>}
        <a className="text-link" href={contextHref("guide", selected)}>Open Guide Finder with these activities →</a>
      </aside>
    </div>
    {content && <div className="guidance-task"><GuideFinder content={content} activities={selected} /></div>}
  </div>;
}
