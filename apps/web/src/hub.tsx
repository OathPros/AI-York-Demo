import React, { useMemo, useState } from "react";
import type { Activity, ContentBundle, ContentItem } from "@ai-york/contracts";

export type Page = "home" | "study" | "teach" | "research" | "work" | "partner" | "policies" | "tools" | "learning" | "events" | "communities" | "news" | "governing" | "index" | "guide";
export type Go = (page: Page) => void;
type Audience = "all" | "students" | "staff";

export const audiencePages: Record<"study" | "teach" | "research" | "work" | "partner", { name: string; who: string; icon: string; activity?: Activity; tags: string[]; intro: string; next: string }> = {
  study: { name: "Learning with AI", who: "Students", icon: "📚", activity: "study", tags: ["study"], intro: "Find out how you can use AI to support your studies, which York-provided tools are open to students, and what to check with your instructors before using AI in coursework.", next: "Course instructions always come first. If a course outline or assignment says how AI may be used, follow it." },
  teach: { name: "Teaching with AI", who: "Instructors", icon: "🎓", activity: "teach", tags: ["teach"], intro: "Build AI literacy, adapt course design and assessment, and set clear expectations for your students. Find York teaching resources, learning pathways and the tools available to instructors.", next: "Tell students what is and is not permitted in each course and assessment." },
  research: { name: "Research and AI", who: "Researchers", icon: "🔬", activity: "research", tags: ["study"], intro: "Use AI in research with attention to privacy, research ethics and information classification. Find library research guidance, workshops and the tools suited to research workflows.", next: "Human-participant data and other regulated information need explicit approval before they go into any AI tool." },
  work: { name: "AI at Work", who: "Staff", icon: "💼", activity: "work", tags: ["work"], intro: "Use York-approved tools for administrative work, check what information you may share with them, and find learning for you and the teams you manage.", next: "Check the information classification before you paste anything into an AI tool." },
  partner: { name: "Partner or Study", who: "External", icon: "🤝", tags: ["partner"], intro: "Explore York's AI-related degrees, certificates and continuing education, and find routes to partner with York on AI.", next: "Programs and partnership contacts are maintained by the offices that run them." }
};

const principles = [
  ["Protect Privacy", "Safeguard personal and sensitive information when using AI tools"],
  ["Stay accountable", "Check AI-outputs for accuracy, references, bias and suitability. Never compromise human judgement or oversight"],
  ["Stay informed", "AI technology is evolving rapidly, we must all do our part to stay informed on and up to date with AI developments, best practices, and institutional policies"],
  ["Be transparent", "Acknowledge AI use where required and appropriate"],
  ["Respect rights", "Consider authorship, consent, fairness and intellectual property and academic integrity"]
];
const dataOptions: { value: string; label: string; hint: string }[] = [
  { value: "none", label: "General", hint: "Brainstorming, asking questions or generating content without sharing documents, personal details or non-public information." },
  { value: "public", label: "Public", hint: "Material anyone can access, such as published York web pages, public reports or openly available journal articles." },
  { value: "internal", label: "Internal York", hint: "Non-public workplace or academic material, such as internal procedures, unpublished drafts or internal service documents." },
  { value: "sensitive", label: "Sensitive", hint: "Personal, confidential or regulated information, such as student or employee records, identifiable research data or confidential financial information." },
  { value: "unsure", label: "Unsure", hint: "Use this if a document combines different kinds of information, or you cannot tell whether it is public, internal or restricted." }
];
const activityLabels: Record<Activity, string> = { work: "Work", study: "Study", teach: "Teach", research: "Research" };
const collectionLabels: Record<string, string> = { policy: "Policy", interpretation: "Guidance", tool: "Tool", event: "Event", community: "Community", training: "Training" };

const ExternalLink = ({ href, children }: { href?: string; children: React.ReactNode }) => (href ? <a className="text-link" href={href} target="_blank" rel="noreferrer">{children} <span aria-hidden="true">↗</span></a> : null);
const Empty = ({ children }: { children: React.ReactNode }) => <p className="empty" role="status">{children}</p>;

export function Principles() {
  return <section className="section" aria-labelledby="principles-title"><p className="eyebrow">Our shared responsibilities</p><h2 id="principles-title">Use AI with care</h2><p className="lead">Everyone has a role in ensuring AI is used ethically, safely and in ways that uphold York's collective values.</p><div className="principles">{principles.map(([title, text], index) => <article key={title}><span className="num">0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>;
}

export function GuideFinder({ content, initial = [] }: { content: ContentBundle; initial?: Activity[] }) {
  const [acts, setActs] = useState<Activity[]>(initial);
  const [taskChoice, setTask] = useState("");
  const [data, setData] = useState("");
  const tasks = useMemo(() => {
    const found = new Map<string, string>();
    for (const item of content.interpretation) if (acts.includes(item.data.activity) && !found.has(item.data.task)) found.set(item.data.task, item.data.taskLabel || item.title);
    return [...found];
  }, [acts, content.interpretation]);
  const task = tasks.some(([key]) => key === taskChoice) ? taskChoice : "";
  const toggle = (activity: Activity) => setActs((current) => (current.includes(activity) ? current.filter((a) => a !== activity) : [...current, activity]));
  const results = acts.map((activity) => ({ activity, item: content.interpretation.find((i) => i.data.activity === activity && i.data.task === task && i.data.data === data) }));
  const ready = acts.length > 0 && task && data;
  const toolById = (id: string) => content.tool.find((tool) => tool.id === id);
  const policyById = (id: string) => content.policy.find((policy) => policy.id === id);
  return (
    <section className="section guide" aria-labelledby="guide-title">
      <p className="eyebrow">Find your answer</p>
      <h2 id="guide-title">Can I use AI for this?</h2>
      <p className="lead">Guidance tailored around your work. Find out which AI tools are appropriate, what rules apply and how to get started.</p>
      <div className="journey">
        <fieldset><legend><span className="num">01</span>I'm using AI to: <small>Choose one or more</small></legend><div className="choices">{(Object.keys(activityLabels) as Activity[]).map((activity) => <label key={activity} className="choice"><input type="checkbox" checked={acts.includes(activity)} onChange={() => toggle(activity)} /> {activityLabels[activity]}</label>)}</div></fieldset>
        <div><label htmlFor="guide-task"><span className="num">02</span>AI will help me</label><select id="guide-task" value={task} disabled={tasks.length === 0} onChange={(e) => setTask(e.target.value)}><option value="">{tasks.length === 0 ? "Choose an activity first" : "Choose a task"}</option>{tasks.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
        <fieldset disabled={!task}><legend><span className="num">03</span>I'll share the following information with AI</legend><div className="choices">{dataOptions.map((option) => <label key={option.value} className="choice"><input type="radio" name="guide-data" checked={data === option.value} onChange={() => setData(option.value)} /> {option.label}<small className="hint">{option.hint}</small></label>)}</div></fieldset>
      </div>
      <div className="status-line" role="status" aria-live="polite">{ready ? `Showing guidance for ${acts.map((a) => activityLabels[a]).join(", ")}.` : "Choose an activity, a task and the information involved. Guidance appears automatically."}</div>
      {ready && <div className="results">{results.map(({ activity, item }) => item ? (
        <article className="result" key={activity}>
          <span className="status">{activityLabels[activity]}</span><h3>{item.title}</h3><p>{item.data.example_use}</p>
          <div className="traffic"><div className="ok"><h4>Generally acceptable</h4><p>{item.data.green}</p></div><div className="warn"><h4>Conditions before use</h4><p>{item.data.yellow}</p></div><div className="no"><h4>Not acceptable</h4><p>{item.data.red}</p></div></div>
          <p>{item.data.tool_advice}</p>
          <div className="pills"><strong>Approved tools:</strong>{(item.data.tool_ids as string[]).map((id) => toolById(id)).filter(Boolean).map((tool) => <a key={tool!.id} href={tool!.data.url} target="_blank" rel="noreferrer">{tool!.data.name}</a>)}</div>
          <div className="pills"><strong>Policy and sources:</strong>{(item.data.sources as string[]).map((id) => policyById(id)).filter(Boolean).map((policy) => <a key={policy!.id} href={policy!.data.url} target="_blank" rel="noreferrer">{policy!.data.title}</a>)}</div>
          {item.data.approval_note && <p className="notice">{item.data.approval_note}</p>}
        </article>
      ) : <Empty key={activity}>No reviewed guidance for {activityLabels[activity]} with this task and information type yet. Use Suggest a Change to tell us what is missing.</Empty>)}</div>}
    </section>
  );
}

function toolVisible(tool: ContentItem, audience: Audience) { return audience === "all" || tool.data.audience === "all" || tool.data.audience === audience; }
const audienceLabel: Record<string, string> = { all: "Students, faculty and staff", students: "Students", staff: "Faculty and staff" };

export function ToolsSection({ content, activity, showFilter = true }: { content: ContentBundle; activity?: Activity; showFilter?: boolean }) {
  const [audience, setAudience] = useState<Audience>("all");
  const tools = content.tool.filter((tool) => toolVisible(tool, audience) && (!activity || (tool.data.activities as string[]).includes(activity)));
  return (
    <section className="section" aria-labelledby="tools-title">
      <p className="eyebrow">York-approved tools</p><h2 id="tools-title">The right tools for you</h2>
      <p className="lead">These tools respect and protect York data in ways commercially available tools do not. Access depends on your role and licence.</p>
      {showFilter && <div className="filters" role="group" aria-label="Filter by access">{([["all", "All tools"], ["students", "For students"], ["staff", "Faculty and staff"]] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={audience === value} onClick={() => setAudience(value)}>{label}</button>)}</div>}
      <div className="grid">{tools.map((tool) => <article className="card" key={tool.id}><span className="status">{audienceLabel[tool.data.audience] ?? ""}</span><h3>{tool.data.name}</h3><p>{tool.data.scope}</p><ExternalLink href={tool.data.url}>Access and requirements</ExternalLink></article>)}</div>
      {tools.length === 0 && <Empty>No tools match this view yet.</Empty>}
    </section>
  );
}

const trainingFilters = [["all", "All resources"], ["basics", "Getting started"], ["work", "Administrative"], ["teach", "Teaching"], ["study", "Study & research"], ["tools", "Tool how-tos"], ["partner", "Degrees & certificates"]] as const;

export function TrainingSection({ content, tags, title = "AI learning at York" }: { content: ContentBundle; tags?: string[]; title?: string }) {
  const [filter, setFilter] = useState("all");
  const base = tags ? content.training.filter((item) => (item.data.tags as string[]).some((tag) => tags.includes(tag))) : content.training;
  const items = filter === "all" ? base : base.filter((item) => (item.data.tags as string[]).includes(filter));
  return (
    <section className="section" aria-labelledby="training-title">
      <p className="eyebrow">Go further</p><h2 id="training-title">{title}</h2>
      <p className="lead">Understand how AI works, learn to use York-approved tools, and develop practical skills for your role.</p>
      {!tags && <div className="filters" role="group" aria-label="Filter AI learning resources">{trainingFilters.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>}
      <div className="grid">{items.map((item) => <article className="card" key={item.id}><span className="status">{item.data.format}</span><h3>{item.title}</h3>{item.data.summary && <p>{item.data.summary}</p>}<ExternalLink href={item.data.url}>Open resource</ExternalLink></article>)}</div>
      {items.length === 0 && <Empty>No training matches that focus yet. Choose another category.</Empty>}
    </section>
  );
}

export function PolicyList({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.policy.filter((policy) => !activity || (policy.data.activities as string[]).includes(activity));
  return <section className="section" aria-labelledby="policy-title"><p className="eyebrow">Policy inventory</p><h2 id="policy-title">Policies and guidelines that apply</h2><div className="grid">{items.map((policy) => <article className="card" key={policy.id}><h3>{policy.data.title}</h3><p>{policy.data.summary || "Summary to be added by an editor."}</p>{(policy.data.owner || policy.data.effectiveDate) && <p className="quiet">{[policy.data.owner, policy.data.effectiveDate && `Effective ${policy.data.effectiveDate}`].filter(Boolean).join(" · ")}</p>}<ExternalLink href={policy.data.url}>Open the authoritative source</ExternalLink></article>)}</div>{items.length === 0 && <Empty>No policies are listed for this area yet.</Empty>}</section>;
}

export function EventList({ content }: { content: ContentBundle }) {
  return <section className="section" aria-labelledby="events-title"><p className="eyebrow">Calendar</p><h2 id="events-title">Upcoming events and trainings</h2><div className="grid">{content.event.map((event) => <article className="card" key={event.id}><span className="status">{event.data.type === "training" ? "Training" : "Event"} · {event.data.date}{event.data.allDay ? "" : ` ${event.data.startTime ?? ""}`}</span><h3>{event.title}</h3><p>{event.data.organizer} · {event.data.audience}</p><p>{event.data.location || ""}</p>{event.data.summary && <p>{event.data.summary}</p>}<ExternalLink href={event.data.onlineLink || event.data.sourceUrl}>More information</ExternalLink></article>)}</div>{content.event.length === 0 && <Empty>No published events yet. Suggest one, or an admin can add it in Studio.</Empty>}</section>;
}

export function CommunityList({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.community.filter((c) => !activity || (c.data.activities as string[]).length === 0 || (c.data.activities as string[]).includes(activity));
  return <section className="section" aria-labelledby="community-title"><p className="eyebrow">Communities</p><h2 id="community-title">Find people and places to connect</h2><div className="grid">{items.map((c) => <article className="card" key={c.id}><h3>{c.data.name}</h3><p>{c.data.summary}</p>{c.data.contact && <p className="quiet">Contact: {c.data.contact}</p>}<ExternalLink href={c.data.url}>Join or learn more</ExternalLink></article>)}</div>{items.length === 0 && <Empty>No communities are listed yet. Admins add them in Studio, or you can suggest one.</Empty>}</section>;
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: React.ReactNode }) {
  return <header className="page-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{intro}</p>{children}</header>;
}

export function AudiencePage({ kind, content, go }: { kind: keyof typeof audiencePages; content: ContentBundle; go: Go }) {
  const page = audiencePages[kind];
  return (
    <>
      <PageHeader eyebrow={`${page.who} · AI @ York`} title={page.name} intro={page.intro}><p className="notice">{page.next}</p></PageHeader>
      {page.activity && <GuideFinder key={kind} content={content} initial={[page.activity]} />}
      {page.activity && <PolicyList content={content} activity={page.activity} />}
      {page.activity && <ToolsSection content={content} activity={page.activity} showFilter={false} />}
      <TrainingSection content={content} tags={page.tags} title={`Training for ${page.who.toLowerCase()}`} />
      {page.activity && <CommunityList content={content} activity={page.activity} />}
      <section className="section"><button onClick={() => go("events")}>See upcoming events <span aria-hidden="true">→</span></button></section>
    </>
  );
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
  return <><PageHeader eyebrow="Governing bodies" title="Who governs AI at York" intro="York's AI Roundtable fosters cross-divisional communication and collaboration on AI implications, and advises on policies and strategies for responsible engagement with AI in teaching and learning, research and operations." /><section className="section"><p className="notice">Placeholder: the committees, offices and contacts that own each policy are not yet recorded in the CMS. Editors will add them once the inventory is confirmed.</p><ExternalLink href="https://www.yorku.ca/ai-at-york/">AI @ York official website</ExternalLink></section></>;
}

export function NewsPage() {
  return <><PageHeader eyebrow="News" title="Latest AI @ York updates" intro="Dated updates on new guidance, tools and policy changes." /><section className="section"><p className="notice">Placeholder: the architecture feeds this section automatically from YFile and the York calendar's AI tag. That feed is not built yet.</p></section></>;
}

export function Home({ content, go }: { content: ContentBundle; go: Go }) {
  const secondary: { page: Page; name: string; text: string; planned?: boolean }[] = [
    { page: "policies", name: "Policy at a Glance", text: "Plain-language summaries of what's allowed" },
    { page: "tools", name: "Approved Tools", text: "YU AURA · Microsoft Copilot · Zoom AI · GitHub Copilot" },
    { page: "events", name: "News & Events", text: "Calendar of AI events and training; news feed planned" },
    { page: "home", name: "Ask AI @ York", text: "Chatbot grounded in approved content only — planned, not yet available", planned: true }
  ];
  return (
    <>
      <section className="hero-block"><p className="eyebrow">Guidance · Tools · Support</p><h1>AI <span className="accent">@</span> York</h1><p className="lead">York University supports the responsible use of artificial intelligence in work, study, teaching and research. Find clear guidance on what you can do, which tools to use and how to get started.</p><div className="actions"><a className="button primary" href="#guide-title">Find guidance</a><button onClick={() => go("tools")}>Explore AI tools</button></div></section>
      <section className="section" aria-label="What do you do with AI?"><div className="tiles">{(Object.keys(audiencePages) as (keyof typeof audiencePages)[]).map((key) => <button key={key} className="tile" onClick={() => go(key)}><span className="tile-icon" aria-hidden="true">{audiencePages[key].icon}</span><strong>{audiencePages[key].name}</strong><small>{audiencePages[key].who}</small></button>)}</div><div className="tiles four">{secondary.map((tile) => tile.planned ? <div key={tile.name} className="tile planned"><strong>{tile.name}</strong><small>{tile.text}</small></div> : <button key={tile.name} className="tile" onClick={() => go(tile.page)}><strong>{tile.name}</strong><small>{tile.text}</small></button>)}</div><button className="index-strip" onClick={() => go("index")}><strong>A–Z INDEX</strong> — All {Object.values(content).flat().length} published AI items, searchable and filterable by activity <span aria-hidden="true">→</span></button></section>
      <Principles />
      <GuideFinder content={content} />
      <ToolsSection content={content} />
      <TrainingSection content={content} />
    </>
  );
}
