import React, { useMemo, useState } from "react";
import type { Activity, ContentBundle, ContentItem, PageCopy } from "@ai-york/contracts";
import { pageCopy } from "./page-copy";
import { Calendar, News, NewsStory, Upcoming } from "./updates";
import { migratedResourceHref } from "./learning";
import { catalogDescription, isProgram } from "./catalog";
import { publicEvents } from "./demo-records";
import homeImage from "./assets/banners/home.webp";
import homeMobile from "./assets/banners/mobile/home.webp";
import partnerImage from "./assets/banners/partner.webp";
import trainingImage from "./assets/banners/study.webp";
import { Icon, PhotoHero } from "./public-ui";

export type Page = "home" | "study" | "teach" | "research" | "work" | "partner" | "policies" | "tools" | "learning" | "events" | "communities" | "news" | "governing" | "index" | "guide" | "guidance" | "training" | "programs" | "governance" | "next-steps";
export type Go = (page: Page) => void;
type Audience = "all" | "students" | "staff";

const principles = [
  ["Protect Privacy", "Safeguard personal and sensitive information when using AI tools"],
  ["Stay accountable", "Check AI-outputs for accuracy, references, bias and suitability. Never compromise human judgement or oversight"],
  ["Stay informed", "AI technology is evolving rapidly, we must all do our part to stay informed on and up to date with AI developments, best practices, and institutional policies"],
  ["Be transparent", "Acknowledge AI use where required and appropriate"],
  ["Respect rights", "Consider authorship, consent, fairness and intellectual property and academic integrity"]
];
const dataOptions: { value: string; label: string; hint: string }[] = [
  { value: "none", label: "General", hint: "Brainstorming, asking questions or generating content without sharing documents, personal details or non-public information" },
  { value: "public", label: "Public", hint: "Material anyone can access, such as published York web pages, public reports or openly available journal articles" },
  { value: "internal", label: "Internal York", hint: "Non-public workplace or academic material, such as internal procedures, unpublished drafts or internal service documents" },
  { value: "sensitive", label: "Sensitive", hint: "Personal, confidential or regulated information, such as student or employee records, identifiable research data or confidential financial information" },
  { value: "unsure", label: "Unsure", hint: "Use this if a document combines different kinds of information, or you cannot tell whether it is public, internal or restricted" }
];
const activityLabels: Record<Activity, string> = { work: "Work", study: "Study", teach: "Teach", research: "Research" };
const sharedTaskLabels: Record<string, string> = {
  draft: "Draft, edit or summarize content",
  analyze: "Analyze information or data",
  code: "Write or review code",
  meet: "Summarize notes or meetings"
};
const collectionLabels: Record<string, string> = { policy: "Policy", interpretation: "Guidance", tool: "Tool", event: "Event", community: "Community", training: "Training" };

export function ResourceLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return null;
  const migrated = migratedResourceHref(href);
  return migrated ? <a className="text-link" href={migrated}>{children}</a> :
    <a className="text-link" href={href} target="_blank" rel="noreferrer">{children}<span className="visually-hidden"> opens in a new tab</span></a>;
}
const Empty = ({ children }: { children: React.ReactNode }) => <p className="empty" role="status">{children}</p>;

function jumpToSection(event: React.MouseEvent<HTMLAnchorElement>) {
  const section = document.getElementById(event.currentTarget.hash.slice(1));
  if (!section) return;
  event.preventDefault();
  section.tabIndex = -1;
  section.focus({ preventScroll: true });
  section.scrollIntoView();
}

export function Principles() {
  return <section className="section principles-section" aria-labelledby="principles-title"><p className="eyebrow">Our shared responsibilities</p><h2 id="principles-title">Use AI with care</h2><p className="lead">Everyone has a role in ensuring AI is used ethically, safely and in ways that uphold York's collective values.</p><div className="principles">{principles.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>;
}

export function GuideFinder({ content, initial = [], activities, standalone = false }: { content: ContentBundle; initial?: Activity[]; activities?: readonly Activity[]; standalone?: boolean }) {
  const Title = standalone ? "h1" : "h2";
  const [localActivities, setActs] = useState<Activity[]>(initial);
  const acts = activities ?? localActivities;
  const [taskChoice, setTask] = useState("");
  const [data, setData] = useState("");
  const tasks = useMemo(() => {
    const found = new Map<string, { label: string; activities: Set<Activity> }>();
    for (const { data, title } of content.interpretation) {
      if (!acts.includes(data.activity)) continue;
      const entry = found.get(data.task) ?? { label: data.taskLabel || title, activities: new Set<Activity>() };
      entry.activities.add(data.activity);
      found.set(data.task, entry);
    }
    return [...found].map(([key, entry]) => [
      key, entry.activities.size > 1 ? sharedTaskLabels[key] ?? entry.label : entry.label
    ] as const);
  }, [acts, content.interpretation]);
  const task = tasks.some(([key]) => key === taskChoice) ? taskChoice : "";
  const toggle = (activity: Activity) => setActs((current) => (current.includes(activity) ? current.filter((a) => a !== activity) : [...current, activity]));
  const results = acts.map((activity) => ({ activity, item: content.interpretation.find((i) => i.data.activity === activity && i.data.task === task && i.data.data === data) }));
  const ready = acts.length > 0 && task && data;
  const toolById = (id: string) => content.tool.find((tool) => tool.id === id);
  const policyById = (id: string) => content.policy.find((policy) => policy.id === id);
  return (
    <section className="section guide" aria-labelledby="guide-title">
      <header className="guide-heading"><Title id="guide-title">{standalone ? "Check a specific use of AI" : "Can I use AI for this"}</Title></header>
      <div className="journey">
        {!activities && <fieldset>
          <legend>I'm using AI to</legend>
          <div className="activity-choices">
            {(Object.keys(activityLabels) as Activity[]).map((activity) => (
              <button type="button" key={activity} className="activity-choice" aria-pressed={acts.includes(activity)} onClick={() => toggle(activity)}>
                {activityLabels[activity]}
              </button>
            ))}
          </div>
        </fieldset>}
        <div>
          <label htmlFor="guide-task">AI will help me</label>
          <div className="journey-select">
            <select id="guide-task" value={task} disabled={tasks.length === 0} onChange={(e) => setTask(e.target.value)}>
              <option value="">{!acts.length || tasks.length ? "Select a task" : "No tasks available"}</option>
              {tasks.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>

        </div>
        <fieldset disabled={!task} hidden={!task}>
          <legend>Information involved</legend>
          <div className="data-choices">
            {dataOptions.map((option) => (
              <label key={option.value} className="data-choice">
                <input type="radio" name="guide-data" checked={data === option.value} onChange={() => setData(option.value)}
                  aria-labelledby={`guide-data-${option.value}-label`} aria-describedby={`guide-data-${option.value}-hint`} />
                <span>
                  <strong id={`guide-data-${option.value}-label`}>{option.label}</strong>
                  <span className="data-hint" id={`guide-data-${option.value}-hint`}>{option.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {ready && acts.length > 1 && <p className="guide-combined-note">Review every result that applies to your task. A result for one activity does not override a restriction in another. A missing result does not establish permission.</p>}
      <div className="visually-hidden" role="status">{ready ? `Showing guidance for ${acts.map((a) => activityLabels[a]).join(", ")}` : ""}</div>
      {ready && <div className="results">{results.map(({ activity, item }) => item ? (
        <article className="result" key={activity}>
          <span className="status">{activityLabels[activity]}</span><h3>{item.title}</h3><p>{item.data.example_use}</p>
          <div className="traffic"><div className="ok"><h4>Generally acceptable</h4><p>{item.data.green}</p></div><div className="warn"><h4>Conditions before use</h4><p>{item.data.yellow}</p></div><div className="no"><h4>Not acceptable</h4><p>{item.data.red}</p></div></div>
          <p>{item.data.tool_advice}</p>
          <div className="pills"><strong>Tools referenced for this activity</strong>{(item.data.tool_ids as string[]).map((id) => toolById(id)).filter(Boolean).map((tool) => <ResourceLink key={tool!.id} href={tool!.data.url}>{tool!.data.name}</ResourceLink>)}</div>
          <div className="pills"><strong>Policy and sources:</strong>{(item.data.sources as string[]).map((id) => policyById(id)).filter(Boolean).map((policy) => <ResourceLink key={policy!.id} href={policy!.data.url}>{policy!.data.title}</ResourceLink>)}</div>
          {item.data.approval_note && <p className="notice">{item.data.approval_note}</p>}
        </article>
      ) : <Empty key={activity}>No reviewed guidance for {activityLabels[activity]} with this task and information type yet. Use Suggest a Change to tell us what is missing.</Empty>)}</div>}
    </section>
  );
}

function toolVisible(tool: ContentItem, audience: Audience) { return audience === "all" || tool.data.audience === "all" || tool.data.audience === audience; }
const audienceLabel: Record<string, string> = { all: "Students, faculty and staff", students: "Students", staff: "Faculty and staff" };

export function ToolsSection({ content, activity, activities, showFilter = true, standalone = false }: { content: ContentBundle; activity?: Activity; activities?: Activity[]; showFilter?: boolean; standalone?: boolean }) {
  const [audience, setAudience] = useState<Audience>("all");
  const selected = activities?.length ? activities : activity ? [activity] : [];
  const tools = content.tool.filter((tool) => toolVisible(tool, audience) && (!selected.length || selected.some((value) => tool.data.activities?.includes(value))));
  const Title = standalone ? "h1" : "h2";
  const ToolTitle = standalone ? "h2" : "h3";
  return <div className={standalone ? "tools-page" : "tools-listing"}>
    <header className={standalone ? "tools-cover" : "section"}>
      <div className={standalone ? "shell tools-cover-inner" : undefined}>
        <div><Title id="tools-title">{standalone ? "Tools and how to get access" : "The right tools for you"}</Title>
        <p className="lead">Compare access and permitted uses for York-approved AI tools.</p></div>
        {standalone && <aside className="tools-cover-note"><Icon name="tools" /><p>Check the information your task involves before sharing it with a tool.</p>
          <a className="text-link" href={selected.length ? `#/guide?activities=${selected.join(",")}` : "#/guide"}>Check a task</a></aside>}
      </div>
    </header>
    <section className="section tools-catalog" aria-labelledby="tools-title">
      {showFilter && <div className="filters" role="group" aria-label="Filter by access">{([["all", "All tools"], ["students", "For students"], ["staff", "Faculty and staff"]] as const).map(([value, label]) =>
        <button key={value} type="button" aria-pressed={audience === value} onClick={() => setAudience(value)}>{label}</button>)}</div>}
      {selected.length > 0 && <div className="listing-head"><p className="status">{selected.map((value) => activityLabels[value]).join(" · ")}</p><a className="text-link" href="#/tools">Show all activities</a></div>}
      <div className="tools-register">{tools.map((tool) => <article className="tool-entry" key={tool.id}>
        <p className="status">{audienceLabel[tool.data.audience] ?? ""}</p>
        <div><ToolTitle>{tool.data.name}</ToolTitle><p>{tool.data.scope}</p>
          {Array.isArray(tool.data.activities) && <p className="quiet">{tool.data.activities.map((value: Activity) => activityLabels[value]).filter(Boolean).join(" · ")}</p>}
        </div>
        <ResourceLink href={tool.data.url}>Access and requirements<span className="visually-hidden"> for {tool.data.name}</span></ResourceLink>
      </article>)}</div>
      {tools.length === 0 && <Empty>No tools match this view.</Empty>}
    </section>
  </div>;
}

const trainingFilters = [["all", "All resources"], ["basics", "Getting started"], ["work", "Administrative"], ["teach", "Teaching"], ["study", "Study & research"], ["tools", "Tool how-tos"]] as const;

export function TrainingSection({ content, tags, title = "AI learning at York" }: { content: ContentBundle; tags?: string[]; title?: string }) {
  const [filter, setFilter] = useState("all");
  const base = tags ? content.training.filter((item) => (item.data.tags as string[]).some((tag) => tags.includes(tag))) : content.training.filter((item) => !isProgram(item));
  const items = filter === "all" ? base : base.filter((item) => (item.data.tags as string[]).includes(filter));
  return (
    <section className="section" aria-labelledby="training-title">
      <p className="eyebrow">Go further</p><h2 id="training-title">{title}</h2>
      <p className="lead">Understand how AI works, learn to use York-approved tools, and develop practical skills for your role.</p>
      {!tags && <div className="filters" role="group" aria-label="Filter AI learning resources">{trainingFilters.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>}
      <div className="grid">{items.map((item) => <article className="card" key={item.id}><span className="status">{item.data.format}</span><h3>{item.title}</h3>{catalogDescription(item) && <p>{catalogDescription(item)}</p>}<ResourceLink href={item.data.url}>Open resource</ResourceLink></article>)}</div>
      {items.length === 0 && <Empty>No training matches this category.</Empty>}
    </section>
  );
}

export function EventList({ content }: { content: ContentBundle }) {
  return <Calendar events={publicEvents(content.event)} />;
}

export function CommunityList({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.community.filter((c) => !activity || (c.data.activities as string[]).length === 0 || (c.data.activities as string[]).includes(activity));
  return <section className="section" aria-labelledby="community-title"><p className="eyebrow">Communities</p><h2 id="community-title">Find people and places to connect</h2><div className="grid">{items.map((c) => <article className="card" key={c.id}><h3>{c.data.name}</h3><p>{c.data.summary}</p>{c.data.contact && <p className="quiet">Contact: {c.data.contact}</p>}<ResourceLink href={c.data.url}>Join or learn more</ResourceLink></article>)}</div>{items.length === 0 && <Empty>No communities are listed yet. Admins add them in Studio, or you can suggest one.</Empty>}</section>;
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: React.ReactNode }) {
  return <header className="page-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{intro}</p>{children}</header>;
}

export function PartnerPage({ content, go, copy = pageCopy.partner }: { content: ContentBundle; go: Go; copy?: PageCopy }) {
  return <>
    <PhotoHero className="partner-hero" image={partnerImage}>
      <h1>{copy.title}</h1><p className="lead">{copy.intro}</p>
    </PhotoHero>
    <section className="shell workplace-examples"><h2>Find the right route</h2>
      <div className="task-notes">
        <article><h3>Find a degree or certificate</h3><p>Use the program links below to compare admissions requirements and delivery options</p></article>
        <article><h3>Explore research partnerships</h3><p>Start with York Research and Innovation to identify researchers, research strengths and ways to collaborate</p><ResourceLink href="https://www.yorku.ca/research/">Contact York Research and Innovation</ResourceLink></article>
      </div>
      <div className="field-example"><h3>Prepare a partnership brief</h3><p>Describe the problem, the people it affects, the expertise you need and a possible first project. Flag data access, ownership and funding questions before anyone shares private material</p></div>
    </section>
    <TrainingSection content={content} tags={["partner"]} title="Training for external audiences" />
    <section className="section"><button onClick={() => go("events")}>See upcoming events</button></section>
  </>;
}

export function IndexPage({ content, go }: { content: ContentBundle; go: Go }) {
  const [query, setQuery] = useState("");
  const [activity, setActivity] = useState("");
  const pageFor: Record<string, Page> = { policy: "policies", interpretation: "guide", tool: "tools", event: "events", community: "communities", training: "learning" };
  const all = Object.values(content).flat() as ContentItem[];
  const needle = query.trim().toLowerCase();
  const hits = all.filter((item) => {
    const acts = (item.data.activities as string[] | undefined) ?? (item.data.activity ? [item.data.activity] : []);
    return (!activity || acts.includes(activity)) && (!needle || `${item.title} ${JSON.stringify(item.data)}`.toLowerCase().includes(needle));
  }).sort((a, b) => a.title.localeCompare(b.title));
  return <><PageHeader eyebrow="A–Z index" title="Search AI @ York" intro="Search titles and descriptions across every published policy, guidance entry, tool, event, community and training item." /><section className="section"><div className="two"><label>Search<input type="search" value={query} onChange={(e) => setQuery(e.target.value)} /></label><label>Activity<select value={activity} onChange={(e) => setActivity(e.target.value)}><option value="">All activities</option>{(Object.keys(activityLabels) as Activity[]).map((a) => <option key={a} value={a}>{activityLabels[a]}</option>)}</select></label></div><p className="status-line" role="status">{hits.length} of {all.length} items</p><ul className="index-list">{hits.slice(0, 200).map((item) => <li key={`${item.collection}-${item.id}`}><span className="status">{collectionLabels[item.collection]}</span> <button className="text-button" onClick={() => go(pageFor[item.collection])}>{item.title}</button></li>)}</ul></section></>;
}

export function GoverningPage() {
  return <><PageHeader eyebrow="Governing bodies" title="Who governs AI at York" intro="York's AI Roundtable brings perspectives from across the university together to shape responsible AI." /><section className="section"><p>Explore the Roundtable, its working groups and the communities connecting people across York.</p><a className="button primary" href="#/governance?section=roundtables">Explore governance</a></section></>;
}

export function NewsPage({ story }: { story?: string }) {
  if (story) return <NewsStory id={story} />;
  return <section className="section updates-page">
    <h1>AI news</h1>
    <p className="lead">Research, teaching and developments across York</p>
    <News />
  </section>;
}

export function Home({ content, copy = pageCopy.home }: { content: ContentBundle; copy?: PageCopy }) {
  return <div className="home-page">
    <PhotoHero className="home-hero" image={homeImage} mobile={homeMobile} id="home-title">
      <h1 id="home-title">{copy.title}</h1>
      <p className="home-lede">{copy.intro}</p>
      <div className="inline-actions">
        <a className="button primary" href="#/guidance">Explore AI guidance</a>
        <a className="button secondary" href="#guide-title" onClick={jumpToSection}>Check a task</a>
      </div>
    </PhotoHero>
    <nav className="shell home-directory" aria-label="Explore AI at York">
      <a href="#/tools"><Icon name="tools" /><strong>Tools and access</strong><span>York-approved AI tools</span></a>
      <a href="#/training"><Icon name="book" /><strong>Training and workshops</strong><span>Practice exercises and resources</span></a>
      <a href="#/governance"><Icon name="people" /><strong>Policy and community</strong><span>Policy, groups and participation</span></a>
    </nav>
    <div className="home-finder"><GuideFinder content={content} /></div>
    <Principles />
    <section className="learning-feature" aria-labelledby="learning-feature-title">
      <img src={trainingImage} alt="" loading="lazy" />
      <div><h2 id="learning-feature-title">Learn by doing</h2>
        <p>Try an exercise in the practice lab, find training for your work or explore York’s AI degrees and certificates.</p>
        <div className="inline-actions"><a className="button primary" href="#/training">Explore training</a><a className="text-link" href="#/programs">Browse programs</a></div>
      </div>
    </section>
    <section className="home-updates" aria-labelledby="home-updates-title">
      <div className="section">
        <h2 id="home-updates-title">Around York</h2>
        <div className="home-updates-grid">
          <div><div className="listing-head"><h3>Latest news</h3><a className="text-link" href="#/news">All news</a></div><News compact /></div>
          <div><div className="listing-head"><h3>Upcoming events</h3><a className="text-link" href="#/events">Full calendar</a></div><Upcoming events={publicEvents(content.event)} /></div>
        </div>
      </div>
    </section>
    <nav className="section home-activities" aria-label="Guidance by activity">
      {(["study", "teach", "research", "work", "partner"] as const).map((key) => <a key={key} href={`#/${key}`}>{pageCopy[key].title}</a>)}
    </nav>
  </div>;
}
