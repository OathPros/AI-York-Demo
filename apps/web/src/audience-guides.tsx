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
  { title: "Check what applies", topics: ["coursework", "assessment", "approvals", "decide", "data", "graduate", "supervision", "funding"] },
  { title: "Plan the task", topics: ["practice", "classroom", "preparation", "methods"] },
  { title: "Find tools and support", topics: ["access", "training", "community"] }
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

  return <div className="guidance-page">
    <header className={`guidance-hero immersive-hero guidance-hero--${single ?? "combined"}`}>
      <img key={single ?? "combined"} src={guides[single ?? "research"].image} alt="" />
      <div className="shell immersive-copy">
        <p className="eyebrow">AI @ York / Guidance</p>
        <h1>{copy?.title ?? "AI guidance for your activities"}</h1>
        <p className="lead">{copy?.intro ?? "Find the requirements, examples and tools that apply across the work you do at York."}</p>
        <div className="context-controls" role="group" aria-label="Guidance activities, choose any combination">
          {contexts.map((context) => {
            const active = selected.includes(context);
            const next = active ? selected.filter((value) => value !== context) : [...selected, context];
            const href = next.length ? contextHref("guidance", next) : "#/guidance?activities=";
            return <button key={context} type="button" aria-pressed={active} onClick={() => { window.location.hash = href; }}>
              {labels[context]}
            </button>;
          })}
        </div>
      </div>
    </header>
    {selected.length > 0 && <>
      {!single && <section className="shell guidance-overview">
        <h2>Selected activities</h2>
        <div>
          {selected.map((activity) => {
            const { title, intro } = copies[activity] ?? pageCopy[activity];
            return <p key={activity}><strong>{title}</strong> · {intro}</p>;
          })}
        </div>
      </section>}
      {examples.length > 0 && <section className="guidance-examples" aria-labelledby="guidance-examples-title">
        <div className="shell guidance-example-layout">
          <h2 id="guidance-examples-title">When activities overlap</h2>
          <div>
            {examples.map(({ title, example }) => <div key={title}><h3>{title}</h3><p>{example}</p></div>)}
          </div>
        </div>
      </section>}
      <div className="shell guidance-reading">
        {stages.map((stage) => {
          const sections = stage.topics.flatMap((id) => topics.filter((topic) => topic.id === id));
          if (!sections.length) return null;
          return <section className="guidance-stage" key={stage.title}>
            <h2>{stage.title}</h2>
            <div className="guidance-topics">
              {sections.map((topic) => <details key={topic.id}>
                <summary><span className="guidance-context-label">{labels[topic.activity]}</span><strong>{topic.title}</strong></summary>
                <div className="guidance-detail">
                  {topic.items.map(([heading, text]) => <div key={heading}><h3>{heading}</h3><p>{text}</p></div>)}
                  {topic.example && <aside><h3>{topic.example[0]}</h3><p>{topic.example[1]}</p></aside>}
                  {topic.links && <ul>{topic.links.map(([label, href]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>}
                </div>
              </details>)}
            </div>
          </section>;
        })}
      </div>
    </>}
    <aside className="shell guidance-resources" aria-labelledby="guidance-resources-title">
      <h2 id="guidance-resources-title">Tools and references</h2>
      <ul>
        <li><a href={contextHref("tools", selected)}>Compare York tools and access</a></li>
        <li><a href={contextHref("training", selected)}>Find training</a></li>
        <li><a href="#/governance">Explore policy and community</a></li>
      </ul>
      {sources.size > 0 && <details><summary>All sources and related resources</summary>
        <ul>{[...sources].map(([href, label]) => <li key={href}><a href={href}>{label}</a></li>)}</ul>
      </details>}
      <a className="text-link" href={contextHref("guide", selected)}>Open Guide Finder</a>
    </aside>
    {content && <div className="guidance-task" hidden={!selected.length}><GuideFinder content={content} activities={selected} /></div>}
  </div>;
}
