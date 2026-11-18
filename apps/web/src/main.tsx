import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { changeTypeLabels, changeTypes, type ChangeType, type DemoRole, type PublicEvent, type SuggestionPayload } from "@ai-york/contracts";
import "./styles.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
type Screen = "home" | "role" | "suggest" | "studio" | "calendar" | "receipt" | "catalogue";
type CatalogueKind = "activity" | "partners" | "guide" | "policies" | "tools" | "learning" | "news" | "communities" | "governing" | "index";
type RequestRow = { id: string; kind: ChangeType; status: string; payload: SuggestionPayload & Record<string, string | boolean | undefined>; created_at: string };
type ReferenceCase = { id: string; activity: string; task: string; data: string; title: string; example_use: string; green: string; yellow: string; red: string; tool_ids: string[]; tool_advice: string; sources: string[] };
type Reference = { tools: Record<string, { name: string; url: string; scope: string }>; sources: Record<string, [string, string]>; cases: ReferenceCase[] };

async function api(path: string, options: RequestInit = {}) {
  const sessionToken = sessionStorage.getItem("ai-york-session");
  const response = await fetch(`${API}${path}`, { ...options, headers: { "content-type": "application/json", ...(sessionToken ? { authorization: `Bearer ${sessionToken}` } : {}), ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || "The demo service is unavailable.");
  if (body.sessionToken) sessionStorage.setItem("ai-york-session", body.sessionToken);
  return body;
}
function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [catalogueKind, setCatalogueKind] = useState<CatalogueKind>("guide");
  const [workspaceId, setWorkspaceId] = useState("");
  const [role, setRole] = useState<DemoRole>("external");
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [receipt, setReceipt] = useState<{ reference: string; receiptSecret: string }>();
  const [visitorLink, setVisitorLink] = useState("");
  const [reference, setReference] = useState<Reference>();
  const [guideFilters, setGuideFilters] = useState({ activity: "work", task: "draft", data: "public" });
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", date: "", startTime: "12:00", endTime: "13:00", allDay: false, timezone: "America/Toronto", organizer: "AI @ York", location: "Online", onlineLink: "", audience: "York community", sourceUrl: "", referringPage: window.location.hash || "#/", pageUrl: "", brokenUrl: "", details: "" });
  const [changeType, setChangeType] = useState<ChangeType>("event");
  const isCalendarType = changeType === "event" || changeType === "training";
  const openCatalogue = (kind: CatalogueKind) => { setCatalogueKind(kind); setScreen("catalogue"); window.history.pushState({}, "", `#/${kind}`); };
  const refreshEvents = async (id = workspaceId) => { if (!id) return; const data = await api(`/api/v1/public/${id}/events`); setEvents(data.events); };
  const loadReference = async (id = workspaceId) => { if (!id) return; const data = await api(`/api/v1/public/${id}/reference`); setReference(data.reference); };
  useEffect(() => {
    const invite = new URLSearchParams(window.location.hash.split("?")[1] || "").get("invite");
    const stored = sessionStorage.getItem("ai-york-workspace");
    const load = async () => {
      try {
        if (invite) {
          const data = await api("/api/v1/demo/redeem", { method: "POST", body: JSON.stringify({ invite }) });
          setWorkspaceId(data.workspaceId);
          sessionStorage.setItem("ai-york-workspace", data.workspaceId);
          window.history.replaceState({}, "", `${window.location.pathname}#/calendar`);
          await refreshEvents(data.workspaceId);
          await loadReference(data.workspaceId);
          setScreen("calendar");
          return;
        }
        if (stored) { setWorkspaceId(stored); await refreshEvents(stored); await loadReference(stored); }
        const path = window.location.hash.replace(/^#\/?/, "").split("?")[0] as CatalogueKind;
        if (["activity", "partners", "guide", "policies", "tools", "learning", "news", "communities", "governing", "index"].includes(path)) { setCatalogueKind(path); setScreen("catalogue"); }
      } catch (e) { setError(e instanceof Error ? e.message : "This demo link is unavailable."); }
    };
    void load();
  }, []);
  const start = async () => { const data = await api("/api/v1/demo/start", { method: "POST" }); setWorkspaceId(data.workspaceId); sessionStorage.setItem("ai-york-workspace", data.workspaceId); await loadReference(data.workspaceId); setScreen("role"); };
  const chooseRole = async (next: DemoRole) => { await api("/api/v1/demo/role", { method: "POST", body: JSON.stringify({ role: next }) }); setRole(next); setScreen(next === "admin" ? "studio" : "suggest"); };
  const loadRequests = async () => { const data = await api("/api/v1/studio/requests"); setRequests(data.requests); };
  const buildPayload = () => {
    const base = { type: changeType, title: form.title, referringPage: form.referringPage };
    if (isCalendarType) return { ...base, date: form.date, startTime: form.allDay ? undefined : form.startTime, endTime: form.allDay ? undefined : form.endTime, allDay: form.allDay, timezone: form.timezone, organizer: form.organizer, location: form.location, audience: form.audience, sourceUrl: form.sourceUrl };
    if (changeType === "broken_link") return { ...base, pageUrl: form.pageUrl, brokenUrl: form.brokenUrl, details: form.details };
    if (changeType === "correction") return { ...base, pageUrl: form.pageUrl, details: form.details, sourceUrl: form.sourceUrl };
    if (changeType === "new_resource") return { ...base, sourceUrl: form.sourceUrl, details: form.details };
    return { ...base, details: form.details };
  };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(""); try { const data = await api("/api/v1/requests", { method: "POST", headers: { "X-Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ kind: changeType, payload: buildPayload(), idempotencyKey: crypto.randomUUID() }) }); setReceipt(data); setScreen("receipt"); } catch (e) { setError(e instanceof Error ? e.message : "Please check the form."); } };
  const publish = async (id: string, action: "publish" | "resolve" | "decline" = "publish") => { await api(`/api/v1/studio/requests/${id}/actions`, { method: "POST", body: JSON.stringify({ action }) }); await loadRequests(); await refreshEvents(); };
  const copyVisitorLink = async () => {
    const data = await api("/api/v1/studio/invites", { method: "POST", body: JSON.stringify({ capability: "visitor" }) });
    const link = `${window.location.origin}${window.location.pathname}#/calendar?invite=${encodeURIComponent(data.token)}`;
    setVisitorLink(link);
    await navigator.clipboard?.writeText(link);
  };
  const openActivity = (activity: string) => { setGuideFilters((f) => ({ ...f, activity })); openCatalogue("guide"); };
  const nav = useMemo(() => <nav aria-label="Primary"><button onClick={() => setScreen("home")}>Home</button><button onClick={() => openCatalogue("policies")}>Policy</button><button onClick={() => openCatalogue("guide")}>Guidance</button><button onClick={() => openCatalogue("tools")}>Tools</button><button onClick={() => openCatalogue("learning")}>Training</button><button onClick={() => { setScreen("calendar"); refreshEvents(); }}>Calendar</button><button onClick={() => setScreen("role")}>Suggest a Change</button></nav>, [workspaceId]);
  const activities = [
    { id: "study", name: "Study", text: "Use AI to learn well, with clarity on assessment rules and academic integrity." },
    { id: "teach", name: "Teach", text: "Design courses and assessments, and set AI expectations for your students." },
    { id: "research", name: "Research", text: "Use AI in research with attention to ethics, data and funder requirements." },
    { id: "work", name: "Work", text: "Use AI in administrative and operational work with the right data safeguards." }
  ];
  const hubSections: { kind: CatalogueKind; name: string; text: string }[] = [
    { kind: "policies", name: "Policy inventory", text: "The policies, directives and standards that apply to AI, with scope and source." },
    { kind: "guide", name: "Usage & Guidance", text: "Do, check and avoid advice for your activity and the information involved." },
    { kind: "tools", name: "Tools & Access", text: "Approved and available tools, who can use them and under what conditions." },
    { kind: "learning", name: "Training", text: "Workshops and learning paths, with scheduled sessions on the calendar." },
    { kind: "news", name: "News", text: "Dated updates on new guidance, tools and policy changes." },
    { kind: "communities", name: "Communities", text: "Groups to join, share practice with and ask questions." },
    { kind: "governing", name: "Governing bodies", text: "The committees and offices that own AI policy and guidance, and how to reach them." }
  ];
  const catalogue = {
    activity: { label: "Activity pages", title: "AI support for your York activity", intro: "Choose the context that best matches what you are doing. Each pathway brings together guidance, tools, learning and events.", cards: ["Study", "Teach", "Research", "Work"] },
    partners: { label: "Partner or study at York", title: "Find the right destination", intro: "Explore degrees, certificates, continuing education and partnership routes related to AI at York.", cards: ["Degrees and certificates", "Continuing education", "Partnerships"] },
    guide: { label: "Usage & Guidance", title: "Practical guidance, in plain language", intro: "Start with what you are trying to do, the information involved and the conditions that apply.", cards: ["What to do", "What to avoid", "Sources and next actions"] },
    policies: { label: "Policy inventory", title: "Policies that apply to AI at York", intro: "Each entry states the policy, who it applies to, its effective date and a link to the authoritative source. Guidance on this site points back to these policies.", cards: ["Responsible use", "Assessment and academic integrity", "Privacy and data", "Research ethics"] },
    tools: { label: "Tools & Access", title: "Tools and how to get access", intro: "Compare tools by activity, eligibility and task. Access conditions and related training stay visible.", cards: ["Microsoft Copilot", "Research tools", "Creative and productivity tools"] },
    learning: { label: "Training", title: "Build confidence through training", intro: "Choose learning for staff, instructors, researchers or students. Scheduled sessions appear on the calendar.", cards: ["Staff learning", "Instructor learning", "Research learning", "Student learning"] },
    news: { label: "News", title: "Latest AI @ York updates", intro: "Browse dated updates and follow the original source for context.", cards: ["What changed", "New guidance", "Community stories"] },
    communities: { label: "Communities", title: "Find people and places to connect", intro: "Discover groups, joining instructions, contact routes and upcoming events.", cards: ["Teaching community", "Research community", "Student community"] },
    governing: { label: "Governing bodies", title: "Who governs AI at York", intro: "The committees, offices and working groups that set AI policy and guidance, what each is responsible for and how to contact them.", cards: ["AI governance committee", "Privacy and information security", "Academic policy bodies", "Research ethics and oversight"] },
    index: { label: "A–Z index", title: "Search AI @ York", intro: "Search titles, aliases and plain-language questions across the published hub.", cards: ["Search all content", "Filter by activity", "Filter by office and access level"] }
  }[catalogueKind];
  const guideResult = reference?.cases.find((item) => item.activity === guideFilters.activity && item.task === guideFilters.task && item.data === guideFilters.data);
  return <div className="app"><div className="ribbon"><span>AI @ York · Demonstration site</span><button onClick={() => setScreen("role")}>Suggest a Change</button></div><header><a className="brand" onClick={() => setScreen("home")}>AI @ York</a>{nav}</header>
    <main>
      {screen === "home" && <><section className="hero"><p className="eyebrow">Practical guidance for York</p><h1>AI at York, organized by what you do.</h1><p>Choose Study, Teach, Research or Work to get policy-backed guidance and the tools that fit your need. This is a demonstration site with fictional content.</p></section><section className="cards four" aria-label="What do you do with AI?">{activities.map((a) => <article key={a.id}><h2>{a.name}</h2><p>{a.text}</p><button className="primary" onClick={() => openActivity(a.id)}>{a.name} with AI <span>→</span></button></article>)}</section><section className="hub"><h2>Across the hub</h2><div className="link-grid">{hubSections.map((s) => <button key={s.kind} onClick={() => openCatalogue(s.kind)}><span className="hub-text"><strong>{s.name}</strong><small>{s.text}</small></span><span aria-hidden="true">→</span></button>)}</div></section></>}
      {screen === "catalogue" && <section className="panel catalogue-page"><p className="eyebrow">{catalogue.label}</p><h1>{catalogue.title}</h1><p>{catalogue.intro}</p>{catalogueKind === "guide" ? <div className="guide-explorer">{!workspaceId && <div className="notice">Start a demo workspace to load the imported guidance dataset.</div>}<div className="two"><label>Activity<select value={guideFilters.activity} onChange={(e) => setGuideFilters({ ...guideFilters, activity: e.target.value })}><option>work</option><option>study</option><option>teach</option><option>research</option></select></label><label>Task<select value={guideFilters.task} onChange={(e) => setGuideFilters({ ...guideFilters, task: e.target.value })}><option>draft</option><option>analyze</option><option>code</option><option>learn</option><option>teach</option><option>research</option></select></label></div><label>Information category<select value={guideFilters.data} onChange={(e) => setGuideFilters({ ...guideFilters, data: e.target.value })}><option>none</option><option>public</option><option>internal</option><option>sensitive</option><option>unsure</option></select></label>{guideResult ? <article className="guide-result"><span className="status">Imported demonstration guidance</span><h2>{guideResult.title}</h2><p>{guideResult.example_use}</p><h3>Recommended approach</h3><p>{guideResult.green}</p><h3>Check before proceeding</h3><p>{guideResult.yellow}</p><h3>Do not</h3><p>{guideResult.red}</p><p>{guideResult.tool_advice}</p><div className="tool-pills">{guideResult.tool_ids.map((toolId) => reference?.tools[toolId] && <a key={toolId} href={reference.tools[toolId].url} target="_blank" rel="noreferrer">{reference.tools[toolId].name}</a>)}</div></article> : <p className="empty">No matching imported case. Suggest an unmet need instead.</p>}<nav className="related" aria-label="Related for this activity"><strong>For {guideFilters.activity}:</strong><button onClick={() => openCatalogue("policies")}>Policy inventory</button><button onClick={() => openCatalogue("tools")}>Tools & Access</button><button onClick={() => openCatalogue("learning")}>Training</button></nav></div> : catalogueKind === "tools" && reference ? <div className="catalogue-grid">{Object.entries(reference.tools).map(([toolId, tool]) => <article key={toolId}><span className="status">Imported demonstration data</span><h2>{tool.name}</h2><p>{tool.scope}</p><a href={tool.url} target="_blank" rel="noreferrer">Open {tool.name}</a></article>)}</div> : <div className="catalogue-grid">{catalogue.cards.map((card) => <article key={card}><span className="status">Illustrative demo content</span><h2>{card}</h2><p>Owner-reviewed content, source links and related events will appear here as this section is published.</p><button onClick={() => setScreen("role")}>Suggest a change <span>→</span></button></article>)}</div>}</section>}
      {screen === "role" && <section className="panel narrow"><p className="eyebrow">Passport York · Demo role selection</p><h1>Choose a role to explore</h1><p>Demo only. Choose a role to explore the prototype. No username, password, Duo prompt or real York session is used.</p><div className="role-grid"><button className="role" onClick={() => (workspaceId ? chooseRole("external") : start())}><strong>External User</strong><span>Suggest an event, training, fix a broken link or tell us what is missing.</span></button><button className="role" onClick={() => (workspaceId ? chooseRole("admin") : start())}><strong>AI @ York Admin</strong><span>Review suggested changes, publish calendar items and resolve the rest.</span></button></div><button className="text-button" onClick={() => setScreen("home")}>Return to AI @ York</button></section>}
      {screen === "suggest" && <section className="panel"><p className="eyebrow">External User</p><h1>Suggest a change</h1><p>Tell us what should change on AI @ York. Share fictional demonstration content only. Your referring page is prefilled below.</p><form onSubmit={submit}><label>What kind of change?<select value={changeType} onChange={(e) => setChangeType(e.target.value as ChangeType)}>{changeTypes.map((t) => <option key={t} value={t}>{changeTypeLabels[t]}</option>)}</select></label><label>{isCalendarType ? (changeType === "training" ? "Training title" : "Event title") : "Short summary"}<input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>{isCalendarType && <><div className="two"><label>Date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Timezone<input required value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label></div><label className="check"><input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} /> All-day</label>{!form.allDay && <div className="two"><label>Start time<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label><label>End time<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label></div>}<div className="two"><label>Organizer<input required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></label><label>Audience<input required value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label></div><label>Location or online link<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label></>}{(changeType === "broken_link" || changeType === "correction") && <label>Page with the problem<input required value={form.pageUrl} onChange={(e) => setForm({ ...form, pageUrl: e.target.value })} /></label>}{changeType === "broken_link" && <label>Broken link address<input type="url" value={form.brokenUrl} onChange={(e) => setForm({ ...form, brokenUrl: e.target.value })} /></label>}{!isCalendarType && <label>{changeType === "correction" ? "What should it say instead?" : changeType === "broken_link" ? "Anything else we should know (optional)" : "Details"}<textarea required={changeType !== "broken_link"} rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></label>}{changeType !== "broken_link" && changeType !== "other" && <label>{isCalendarType ? "Source URL" : "Link or source (optional)"}<input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} /></label>}<label>Referring page<input readOnly value={form.referringPage} /></label>{error && <p className="error">{error}</p>}<button className="primary" type="submit">Preview and submit</button></form></section>}
      {screen === "receipt" && <section className="panel narrow"><p className="eyebrow">Received for review</p><h1>Thanks for helping improve AI @ York.</h1><p>Your suggestion has been saved in the demonstration workspace.</p><div className="receipt"><strong>Reference</strong><code>{receipt?.reference}</code><strong>Private receipt secret</strong><code>{receipt?.receiptSecret}</code></div><button className="primary" onClick={() => { setRole("admin"); setScreen("studio"); }}>Switch demo role</button></section>}
      {screen === "studio" && <section className="panel"><div className="studio-head"><div><p className="eyebrow">AI @ York Studio · Workspace {workspaceId.slice(-8)}</p><h1>Requests inbox</h1></div><button onClick={() => { setRole("external"); setScreen("suggest"); }}>Switch demo role</button></div><p>Review incoming suggestions before they appear publicly.</p><div className="actions"><button onClick={loadRequests}>Refresh inbox</button><button onClick={copyVisitorLink}>Copy visitor link</button></div>{visitorLink && <p className="success">Visitor link copied. It grants public reads and external suggestions, not Studio access.</p>}<div className="request-list">{requests.map((request) => <article className="request" key={request.id}><div><span className="status">{request.status}</span> <span className="status">{changeTypeLabels[request.kind] ?? request.kind}</span><h2>{request.payload.title}</h2><p>{request.kind === "event" || request.kind === "training" ? `${request.payload.date} · ${request.payload.organizer} · ${request.payload.audience}` : [request.payload.pageUrl, request.payload.brokenUrl, request.payload.sourceUrl, request.payload.details].filter(Boolean).join(" · ")}</p></div>{request.status === "received" && <div className="actions">{request.kind === "event" || request.kind === "training" ? <button className="primary" onClick={() => publish(request.id)}>Publish to calendar</button> : <button className="primary" onClick={() => publish(request.id, "resolve")}>Mark as resolved</button>}<button onClick={() => publish(request.id, "decline")}>Decline</button></div>}</article>)}{requests.length === 0 && <p className="empty">No requests loaded. Refresh inbox to check the workspace.</p>}</div></section>}
      {screen === "calendar" && <section className="panel"><p className="eyebrow">Calendar</p><h1>Upcoming events</h1><p>Published records update on the next fetch. Drafts and declined suggestions are not shown.</p><div className="event-list">{events.map((event) => <article className="event" key={event.id}><p className="eyebrow">{event.date} · {event.timezone}{event.type === "training" ? " · Training" : ""}</p><h2>{event.title}</h2><p>{event.organizer} · {event.audience}</p><p>{event.location || event.onlineLink}</p></article>)}{events.length === 0 && <p className="empty">No published events in this workspace yet.</p>}</div></section>}
    </main><footer><span>AI @ York · Demonstration site</span><a href="https://ai.yorku.ca/" target="_blank" rel="noreferrer">Official AI @ York website</a></footer></div>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
