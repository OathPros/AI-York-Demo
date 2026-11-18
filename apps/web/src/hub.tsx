import React, { useMemo, useState } from "react";
import type { Activity, ContentBundle, ContentItem, PageCopy } from "@ai-york/contracts";
import { pageCopy } from "./page-copy";
import { Calendar, News, Upcoming } from "./updates";
import { migratedLearningHref, StudyGuidance, TeachingGuidance } from "./learning";

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

function ResourceLink({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) return null;
  const migrated = migratedLearningHref(href);
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
          <div className="pills"><strong>Policy and sources:</strong>{(item.data.sources as string[]).map((id) => policyById(id)).filter(Boolean).map((policy) => <ResourceLink key={policy!.id} href={policy!.data.url}>{policy!.data.title}</ResourceLink>)}</div>
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
      <div className="grid">{tools.map((tool) => <article className="card" key={tool.id}><span className="status">{audienceLabel[tool.data.audience] ?? ""}</span><h3>{tool.data.name}</h3><p>{tool.data.scope}</p><ResourceLink href={tool.data.url}>Access and requirements</ResourceLink></article>)}</div>
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
      <div className="grid">{items.map((item) => <article className="card" key={item.id}><span className="status">{item.data.format}</span><h3>{item.title}</h3>{item.data.summary && <p>{item.data.summary}</p>}<ResourceLink href={item.data.url}>Open resource</ResourceLink></article>)}</div>
      {items.length === 0 && <Empty>No training matches that focus yet. Choose another category.</Empty>}
    </section>
  );
}

export function PolicyList({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.policy.filter((policy) => !activity || (policy.data.activities as string[]).includes(activity));
  return <section className="section" aria-labelledby="policy-title"><p className="eyebrow">Policy inventory</p><h2 id="policy-title">Policies and guidelines that apply</h2><div className="grid">{items.map((policy) => <article className="card" key={policy.id}><h3>{policy.data.title}</h3>{policy.data.summary && <p>{policy.data.summary}</p>}{(policy.data.owner || policy.data.effectiveDate) && <p className="quiet">{[policy.data.owner, policy.data.effectiveDate && `Effective ${policy.data.effectiveDate}`].filter(Boolean).join(" · ")}</p>}<ResourceLink href={policy.data.url}>{migratedLearningHref(policy.data.url || "") ? "Read the guide" : "Open the authoritative source"}</ResourceLink></article>)}</div>{items.length === 0 && <Empty>No policies are listed for this area yet.</Empty>}</section>;
}

export function EventList({ content }: { content: ContentBundle }) {
  return <section className="section updates-page">
    <h1>AI calendar</h1>
    <p className="lead">Browse AI workshops and events by month, topic or type</p>
    <Calendar events={content.event} />
  </section>;
}

export function CommunityList({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.community.filter((c) => !activity || (c.data.activities as string[]).length === 0 || (c.data.activities as string[]).includes(activity));
  return <section className="section" aria-labelledby="community-title"><p className="eyebrow">Communities</p><h2 id="community-title">Find people and places to connect</h2><div className="grid">{items.map((c) => <article className="card" key={c.id}><h3>{c.data.name}</h3><p>{c.data.summary}</p>{c.data.contact && <p className="quiet">Contact: {c.data.contact}</p>}<ResourceLink href={c.data.url}>Join or learn more</ResourceLink></article>)}</div>{items.length === 0 && <Empty>No communities are listed yet. Admins add them in Studio, or you can suggest one.</Empty>}</section>;
}

export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children?: React.ReactNode }) {
  return <header className="page-head"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{intro}</p>{children}</header>;
}

export function AudiencePage({ kind, content, go, copy = pageCopy[kind] }: { kind: keyof typeof audiencePages; content: ContentBundle; go: Go; copy?: PageCopy }) {
  const page = audiencePages[kind];
  return (
    <>
      <section className={`experience-hero ${kind}-hero`}><div className="shell">
        <h1>{copy.title}</h1><p className="experience-lede">{copy.intro}</p>
      </div></section>
      {kind === "study" && <StudyGuidance />}
      {kind === "partner" && <section className="shell workplace-examples"><h2>Find the right route</h2>
        <div className="task-notes">
          <article><h3>Find a degree or certificate</h3><p>Use the program links below to compare admissions requirements and delivery options</p></article>
          <article><h3>Explore research partnerships</h3><p>Start with York Research and Innovation to identify researchers, research strengths and ways to collaborate</p><ResourceLink href="https://www.yorku.ca/research/">Contact York Research and Innovation</ResourceLink></article>
        </div>
        <div className="field-example"><h3>Prepare a partnership brief</h3><p>Describe the problem, the people it affects, the expertise you need and a possible first project. Flag data access, ownership and funding questions before anyone shares private material</p></div>
      </section>}
      {page.activity && <GuideFinder key={kind} content={content} initial={[page.activity]} />}
      {page.activity && <PolicyList content={content} activity={page.activity} />}
      {page.activity && <ToolsSection content={content} activity={page.activity} showFilter={false} />}
      <TrainingSection content={content} tags={page.tags} title={`Training for ${page.who.toLowerCase()}`} />
      {page.activity && <CommunityList content={content} activity={page.activity} />}
      <section className="section"><button onClick={() => go("events")}>See upcoming events <span aria-hidden="true">→</span></button></section>
    </>
  );
}

export function TeachingPage({ content, copy = pageCopy.teach }: { content: ContentBundle; copy?: PageCopy }) {
  return <div className="experience-page teaching-page">
    <section className="experience-hero teaching-hero">
      <div className="shell">
        <p className="eyebrow">Teaching and learning</p>
        <h1>{copy.title}</h1><p className="experience-lede">{copy.intro}</p>
        <div className="hero-actions">
          <a className="button primary" href="#teaching-practice-heading" onClick={jumpToSection}>Plan your approach</a>
          <a className="button inverse" href="#/learning">AI fundamentals</a>
        </div>
      </div>
    </section>
    <TeachingGuidance />
    <GuideFinder content={content} initial={["teach"]} />
    <ToolsSection content={content} activity="teach" showFilter={false} />
    <TrainingSection content={content} tags={["teach"]} title="Teaching resources" />
    <PolicyList content={content} activity="teach" />
  </div>;
}

const researchChecks = [
  ["Research ethics", "Confirm that the proposed use is consistent with the approved protocol, participant consent and any required amendments"],
  ["Information and privacy", "Classify the information before it enters a tool and avoid identifiable or restricted participant data unless the workflow is explicitly authorized"],
  ["Research integrity", "Verify claims, citations, calculations and code. Record material AI use when transparency or reproducibility requires it"],
  ["Agreements and rights", "Check funder, partner, publisher, licence, intellectual property and Indigenous data governance requirements"]
];

export function ResearchPage({ content, copy = pageCopy.research }: { content: ContentBundle; copy?: PageCopy }) {
  return <div className="experience-page research-page">
    <section className="experience-hero research-hero"><div className="shell"><p className="eyebrow">Research and innovation</p><h1>{copy.title}</h1><p className="experience-lede">{copy.intro}</p><div className="hero-actions"><a className="button primary" href="#research-checks" onClick={jumpToSection}>Review the checks</a><a className="button inverse" href="https://www.yorku.ca/research/use-of-artificial-intelligence-york/" target="_blank" rel="noreferrer">View the source page</a></div></div></section>
    <section className="experience-intro shell"><div><p className="eyebrow">Before you use a tool</p><h2>Start with the research context</h2></div><p>A tool may be suitable for public or synthetic material and still be unsuitable for identifiable data, confidential partner information or a study governed by specific consent. Review the full workflow before moving research material into an AI service</p></section>
    <section className="research-checks shell" id="research-checks" aria-labelledby="research-checks-title"><div className="section-heading"><p className="eyebrow">Decision framework</p><h2 id="research-checks-title">Four checks before use</h2></div><div className="check-list">{researchChecks.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
    <section className="red-band"><div className="shell split-band"><div><p className="eyebrow">Human participant research</p><h2>Authorization comes before transfer</h2></div><p>Do not place identifiable or restricted participant information in an AI service unless the use is covered by consent, ethics approval and an authorized data environment. De-identification alone may not remove the risk</p></div></section>
    <section className="shell field-example">
      <h2>Plan a literature screening workflow</h2>
      <p>Use approved public metadata to test search terms and draft screening criteria. Have a researcher confirm each inclusion decision against the original source and log the tool, date, version and checks in the project records</p>
      <ResourceLink href="https://researchguides.library.yorku.ca/genairesearch">Open the library guide to generative AI in research</ResourceLink>
    </section>
    <GuideFinder content={content} initial={["research"]} />
    <ToolsSection content={content} activity="research" showFilter={false} />
    <TrainingSection content={content} tags={["study"]} title="Research learning and support" />
    <PolicyList content={content} activity="research" />
  </div>;
}

const workExamples = [
  ["Draft a service update", "Start with public facts or a fictional example. Verify names, dates and commitments before a person approves the message"],
  ["Analyse unit information", "Prototype with synthetic data. Check the classification and approved tool configuration before uploading an internal export"],
  ["Summarize a meeting", "Check whether the meeting is suitable, notify participants and obtain required consent before enabling an assistant"]
];

export function WorkPage({ content, copy = pageCopy.work }: { content: ContentBundle; copy?: PageCopy }) {
  return <div className="experience-page work-page">
    <section className="experience-hero work-hero">
      <div className="shell">
        <h1>{copy.title}</h1>
        <p className="experience-lede">{copy.intro}</p>
        <a className="button primary" href="#guide-title" onClick={jumpToSection}>Check a workplace task</a>
      </div>
    </section>
    <section className="shell workplace-examples" aria-labelledby="work-examples">
      <h2 id="work-examples">Using AI in your day to day work</h2>
      <div className="task-notes">{workExamples.map(([title, description]) => <article key={title}>
        <h3>{title}</h3><p>{description}</p>
      </article>)}</div>
      <p>Keep people accountable for decisions and review outputs before sharing them</p>
      <div className="field-example"><h3>Review an AI assisted message before sending</h3><p>Compare the draft with the source material. Verify the facts, check whether any recipient should see the information and have the person responsible for the message approve it</p></div>
    </section>
    <GuideFinder content={content} initial={["work"]} />
    <ToolsSection content={content} activity="work" showFilter={false} />
    <TrainingSection content={content} tags={["work"]} title="Workplace learning" />
    <PolicyList content={content} activity="work" />
    <section className="work-source"><div className="shell">
      <h2>York’s AI initiative</h2>
      <p>The Office of the CIO connects responsible adoption with the guidelines, supported technology and training staff need for day to day work</p>
      <ResourceLink href="https://www.yorku.ca/uit/cio/artificial-intelligence-initiative/">Read the CIO initiative</ResourceLink>
    </div></section>
  </div>;
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
  return <><PageHeader eyebrow="Governing bodies" title="Who governs AI at York" intro="York's AI Roundtable fosters cross-divisional communication and collaboration on AI implications, and advises on policies and strategies for responsible engagement with AI in teaching and learning, research and operations." /><section className="section"><p className="notice">Placeholder: the committees, offices and contacts that own each policy are not yet recorded in the CMS. Editors will add them once the inventory is confirmed.</p><ResourceLink href="https://www.yorku.ca/ai-at-york/">AI @ York official website</ResourceLink></section></>;
}

export function NewsPage() {
  return <section className="section updates-page">
    <h1>AI news</h1>
    <p className="lead">Explore updates by topic and see where each story came from</p>
    <News />
  </section>;
}

export function Home({ content, go, copy = pageCopy.home }: { content: ContentBundle; go: Go; copy?: PageCopy }) {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-shell home-hero-copy">
          <h1 id="home-title">{copy.title}</h1>
          <p>{copy.intro}</p>
          <div className="hero-actions">
            <a className="button primary" href="#guide-title" onClick={jumpToSection}>Find guidance</a>
            <button className="button inverse" onClick={() => go("tools")}>Explore AI tools</button>
          </div>
        </div>
      </section>
      <section className="home-statement"><div className="home-shell"><p><strong>Start with what you are doing</strong> then check the information involved, the rules that apply and the tool you plan to use</p><button onClick={() => go("work")}>Explore AI at work</button></div></section>
      <section className="section home-updates" aria-labelledby="home-updates-title">
        <h2 id="home-updates-title">News and events</h2>
        <div className="home-updates-grid">
          <div>
            <h3>Latest news</h3>
            <News compact />
            <a className="text-link" href="#/news">See all news</a>
          </div>
          <div>
            <h3>Upcoming events</h3>
            <Upcoming events={content.event} />
            <a className="text-link" href="#/events">Open the calendar</a>
          </div>
        </div>
      </section>
      <Principles />
      <GuideFinder content={content} />
      <ToolsSection content={content} />
      <section className="home-next">
        <div className="home-shell home-next-grid">
          <div><h2>Find guidance for your role</h2><p>Get practical examples, policy links and tools for the work you do</p></div>
          <div className="home-route-list">
            {(["study", "teach", "research", "work", "partner"] as const).map((key) => (
              <button key={key} onClick={() => go(key)}><strong>{audiencePages[key].name}</strong><b aria-hidden="true">→</b></button>
            ))}
          </div>
        </div>
      </section>
      <TrainingSection content={content} />
      <section className="home-index"><div className="home-shell"><div><p className="eyebrow">Everything in one place</p><h2>Search AI at York</h2><p>Browse all {Object.values(content).flat().length} published guidance items, policies, tools, events, communities and learning resources</p></div><button className="button dark" onClick={() => go("index")}>Open the A to Z index <span aria-hidden="true">→</span></button></div></section>
    </div>
  );
}
