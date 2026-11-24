import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { activitySchema, changeTypeLabels, changeTypes, contentCollections, type ChangeType, type ContentBundle, type DemoRole, type SuggestionPayload } from "@ai-york/contracts";
import { api } from "./api";
import { EventList, GuideFinder, Home, IndexPage, NewsPage, PartnerPage, ToolsSection, type Page } from "./hub";
import { CmsManager, PageEditor, PolicyStudio, StudioShell, type StudioView } from "./studio";
import type { PublishedPages } from "./page-copy";
import "./styles.css";
import { GuidancePage, ProgramsPage, TrainingPage } from "./information-architecture";
import { guidanceSelection } from "./audience-guides";
import "./public-site.css";
import "./public-experiences.css";
import "./policies-reports.css";
import { Icon } from "./public-ui";
import { GovernancePage } from "./policies-reports";
import { GroupPage } from "./governance-groups";
import { DemoBanner } from "./demo-banner";
import { WorkplanPage } from "./workplan";

type Screen = "site" | "role" | "suggest" | "studio" | "receipt";

type RequestRow = { id: string; kind: ChangeType; status: string; payload: SuggestionPayload & Record<string, string | boolean | undefined>; created_at: string };
const pages: Page[] = ["home", "study", "teach", "research", "work", "partner", "policies", "tools", "learning", "events", "communities", "news", "governing", "index", "guide", "guidance", "training", "programs", "governance", "next-steps"];
const emptyContent = (): ContentBundle => Object.fromEntries(contentCollections.map((name) => [name, []])) as unknown as ContentBundle;
const pageFromHash = (): Page => { const key = window.location.hash.replace(/^#\/?/, "").split("?")[0]; return key.startsWith("governance/groups/") ? "governance" : key === "initiative" ? "work" : pages.includes(key as Page) ? key as Page : "home"; };

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("site");
  const [page, setPage] = useState<Page>(pageFromHash());
  const [hash, setHash] = useState(window.location.hash);
  const [workspaceId, setWorkspaceId] = useState("");
  const [role, setRole] = useState<DemoRole>("external");
  const [content, setContent] = useState<ContentBundle>(emptyContent());
  const [adminContent, setAdminContent] = useState<ContentBundle>(emptyContent());
  const [studioView, setStudioView] = useState<StudioView>("overview");
  const [publishedPages, setPublishedPages] = useState<PublishedPages>({});
  useEffect(() => {
    if (!workspaceId) return;
    let active = true;
    api(`/api/v1/public/${workspaceId}/pages`).then(({ pages }) => {
      if (active) setPublishedPages(pages);
    }).catch(() => {
      if (active) setPublishedPages({});
    });
    return () => { active = false; };
  }, [workspaceId]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [receipt, setReceipt] = useState<{ reference: string; receiptSecret: string }>();
  const [visitorLink, setVisitorLink] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", date: "", startTime: "12:00", endTime: "13:00", allDay: false, timezone: "America/Toronto", organizer: "AI @ York", location: "Online", onlineLink: "", audience: "York community", sourceUrl: "", referringPage: window.location.hash || "#/", pageUrl: "", brokenUrl: "", details: "" });
  const [changeType, setChangeType] = useState<ChangeType>("event");
  const isCalendarType = changeType === "event" || changeType === "training";

  const go = useCallback((next: Page) => { const nextHash = `#/${next}`; setPage(next); setHash(nextHash); setScreen("site"); window.history.pushState({}, "", nextHash); window.scrollTo(0, 0); }, []);
  useEffect(() => setMenuOpen(false), [hash]);
  const navigateLink = (event: React.MouseEvent<HTMLAnchorElement>, next: Page) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(next);
  };
  const loadContent = useCallback(async (id = workspaceId) => { const data = await api(id ? `/api/v1/public/${id}/content` : "/api/v1/public/content"); setContent(data.content); }, [workspaceId]);
  const loadAdminContent = useCallback(async () => { const data = await api("/api/v1/studio/content"); setAdminContent(data.content); await loadContent(); }, [loadContent]);
  const loadRequests = async () => { const data = await api("/api/v1/studio/requests"); setRequests(data.requests); };

  useEffect(() => {
    const onPop = () => { setPage(pageFromHash()); setHash(window.location.hash); setScreen("site"); };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("hashchange", onPop); };
  }, []);
  useEffect(() => {
    const invite = new URLSearchParams(window.location.hash.split("?")[1] || "").get("invite");
    const stored = sessionStorage.getItem("ai-york-workspace");
    const load = async () => {
      try {
        if (invite) {
          const data = await api("/api/v1/demo/redeem", { method: "POST", body: JSON.stringify({ invite }) });
          setWorkspaceId(data.workspaceId);
          sessionStorage.setItem("ai-york-workspace", data.workspaceId);
          window.history.replaceState({}, "", `${window.location.pathname}#/events`);
          setPage("events");
          setHash("#/events");
          await loadContent(data.workspaceId);
          return;
        }
        if (stored) setWorkspaceId(stored);
        await loadContent(stored || "");
      } catch (e) { setError(e instanceof Error ? e.message : "This workspace link is unavailable."); }
    };
    void load();
  }, []);

  const chooseRole = async (next: DemoRole) => {
    setError("");
    try {
      let id = workspaceId;
      if (!id) {
        const data = await api("/api/v1/demo/start", { method: "POST" });
        id = data.workspaceId;
        setWorkspaceId(id);
        sessionStorage.setItem("ai-york-workspace", id);
      }
      await api("/api/v1/demo/role", { method: "POST", body: JSON.stringify({ role: next }) });
      setRole(next);
      await loadContent(id);
      if (next === "admin") {
        setStudioView("overview");
        const [inbox, inventory] = await Promise.all([api("/api/v1/studio/requests"), api("/api/v1/studio/content")]);
        setRequests(inbox.requests);
        setAdminContent(inventory.content);
        setScreen("studio");
      } else {
        setScreen("suggest");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not open the workspace");
    }
  };
  const buildPayload = () => {
    const base = { type: changeType, title: form.title, referringPage: form.referringPage };
    if (isCalendarType) return { ...base, date: form.date, startTime: form.allDay ? undefined : form.startTime, endTime: form.allDay ? undefined : form.endTime, allDay: form.allDay, timezone: form.timezone, organizer: form.organizer, location: form.location, audience: form.audience, sourceUrl: form.sourceUrl };
    if (changeType === "broken_link") return { ...base, pageUrl: form.pageUrl, brokenUrl: form.brokenUrl, details: form.details };
    if (changeType === "correction") return { ...base, pageUrl: form.pageUrl, details: form.details, sourceUrl: form.sourceUrl };
    if (changeType === "new_resource") return { ...base, sourceUrl: form.sourceUrl, details: form.details };
    return { ...base, details: form.details };
  };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(""); try { const data = await api("/api/v1/requests", { method: "POST", headers: { "X-Idempotency-Key": crypto.randomUUID() }, body: JSON.stringify({ kind: changeType, payload: buildPayload(), idempotencyKey: crypto.randomUUID() }) }); setReceipt(data); setScreen("receipt"); } catch (e) { setError(e instanceof Error ? e.message : "Please check the form."); } };
  const act = async (id: string, action: "publish" | "resolve" | "decline" = "publish") => { await api(`/api/v1/studio/requests/${id}/actions`, { method: "POST", body: JSON.stringify({ action }) }); await loadRequests(); await loadAdminContent(); };
  const copyVisitorLink = async () => {
    const data = await api("/api/v1/studio/invites", { method: "POST", body: JSON.stringify({ capability: "visitor" }) });
    const link = `${window.location.origin}${window.location.pathname}#/events?invite=${encodeURIComponent(data.token)}`;
    setVisitorLink(link);
    await navigator.clipboard?.writeText(link);
  };
  const suggest = () => { setForm((f) => ({ ...f, referringPage: window.location.hash || "#/" })); setScreen("role"); };
  const requestGroupJoin = (name: string) => {
    setChangeType("other");
    setForm((current) => ({ ...current, title: `Join ${name}`, details: `I would like to join ${name}.`, referringPage: window.location.hash || "#/" }));
    setScreen("role");
  };
  const openStudio = () => {
    if (workspaceId && role === "admin") void chooseRole("admin");
    else suggest();
  };

  const params = new URLSearchParams(hash.split("?")[1] || "");
  const selectedActivity = activitySchema.safeParse(params.get("activity"));
  const activity = selectedActivity.success ? selectedActivity.data : undefined;
  const selectedContexts = guidanceSelection(params);
  const requestedLevel = params.get("level");
  const level = requestedLevel === "undergraduate" || requestedLevel === "graduate" || requestedLevel === "certificate" ? requestedLevel : undefined;
  const governanceSection = params.get("section") || (page === "communities" ? "community" : page === "governing" ? "roundtables" : undefined);
  const groupId = hash.replace(/^#\/?/, "").split("?")[0].match(/^governance\/groups\/([^/]+)\/?$/)?.[1];

  const renderPage = () => {
    switch (page) {
      case "home": return <Home content={content} copy={publishedPages.home} />;
      case "study": case "teach": case "research": case "work":
        return <GuidancePage activity={page} copies={publishedPages} content={content} />;
      case "partner": return <PartnerPage content={content} go={go} copy={publishedPages.partner} />;
      case "guide": return <GuideFinder key={selectedContexts.join(",")} content={content} initial={selectedContexts} standalone />;
      case "guidance": return <GuidancePage activities={selectedContexts} copies={publishedPages} content={content} taskView={selectedContexts.length > 0 && params.get("view") === "task"} />;
      case "policies": case "governing": case "communities": case "governance": return groupId ? <GroupPage id={groupId} record={params.get("record") ?? undefined} onRequestJoin={requestGroupJoin} /> : <GovernancePage content={content} section={governanceSection} />;
      case "tools": return <ToolsSection content={content} activities={selectedContexts} standalone />;
      case "learning": case "training": return <TrainingPage content={content} activity={activity} activities={selectedContexts} />;
      case "programs": return <ProgramsPage content={content} level={level} />;
      case "events": return <EventList content={content} />;
      case "news": return <NewsPage story={params.get("story") ?? undefined} />;
      case "next-steps": return <WorkplanPage section={params.get("section") ?? undefined} />;
      case "index": return <IndexPage content={content} go={go} />;
    }
  };

  const navItems: [Page, string][] = [["guidance", "Guidance"], ["training", "Training"], ["programs", "Programs"], ["tools", "Tools"], ["governance", "Policy & community"], ["events", "Calendar"], ["news", "News"]];
  const currentNav: Page = ["study", "teach", "research", "work", "guide"].includes(page) ? "guidance" : page === "learning" ? "training" : ["policies", "governing", "communities"].includes(page) ? "governance" : page;
  return <div className={screen === "site" ? "app public-site" : "app"}><DemoBanner publicNotice={screen !== "studio"} nextStepsCurrent={screen === "site" && page === "next-steps"} onSuggest={screen !== "studio" ? suggest : undefined} onOpenStudio={screen !== "studio" ? openStudio : undefined} />{screen !== "studio" && <>
    <header className="site-header"><a className="brand" href="#/home" aria-label="AI @ York home" onClick={(e) => navigateLink(e, "home")}><span>AI <b>@</b> York</span>{screen !== "site" && <small>Guidance tools support</small>}</a>{screen === "site" && <button type="button" className="site-menu-toggle" aria-expanded={menuOpen} aria-controls="primary-nav" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? "close" : "menu"} />{menuOpen ? "Close menu" : "Menu"}</button>}<nav id="primary-nav" data-open={menuOpen} aria-label="Primary">{navItems.map(([key, label]) => <a key={key} href={`#/${key}`} aria-current={screen === "site" && currentNav === key ? "page" : undefined} onClick={(e) => navigateLink(e, key)}>{label}</a>)}<a className="nav-primary" href="#/guide" onClick={(e) => navigateLink(e, "guide")}>Can I use AI for this</a></nav></header></>}
    <main>
      {screen === "site" && <>{error && <p className="error" role="alert">{error}</p>}{renderPage()}</>}
      {screen === "role" && <section className="panel narrow"><p className="eyebrow">Workspace access</p><h1>Choose how to continue</h1><p>Select a role to suggest an update or manage content.</p>{error && <p className="error" role="alert">{error}</p>}<div className="role-grid"><button className="role" onClick={() => chooseRole("external")}><strong>External User</strong><span>Suggest an event, training, fix a broken link or tell us what is missing.</span></button><button className="role" onClick={() => chooseRole("admin")}><strong>AI @ York Admin</strong><span>Manage the policy, interpretation, tool, event, community and training inventories, and review suggested changes.</span></button></div><button className="text-button" onClick={() => go("home")}>Return to AI @ York</button></section>}
      {screen === "suggest" && <section className="panel"><p className="eyebrow">External User</p><h1>Suggest a change</h1><p>Tell us what should change on AI @ York. Your referring page is included below.</p><form onSubmit={submit}><label>What kind of change?<select value={changeType} onChange={(e) => setChangeType(e.target.value as ChangeType)}>{changeTypes.map((t) => <option key={t} value={t}>{changeTypeLabels[t]}</option>)}</select></label><label>{isCalendarType ? (changeType === "training" ? "Training title" : "Event title") : "Short summary"}<input required minLength={3} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>{isCalendarType && <><div className="two"><label>Date<input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Timezone<input required value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label></div><label className="check"><input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} /> All-day</label>{!form.allDay && <div className="two"><label>Start time<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label><label>End time<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label></div>}<div className="two"><label>Organizer<input required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></label><label>Audience<input required value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></label></div><label>Location or online link<input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label></>}{(changeType === "broken_link" || changeType === "correction") && <label>Page with the problem<input required value={form.pageUrl} onChange={(e) => setForm({ ...form, pageUrl: e.target.value })} /></label>}{changeType === "broken_link" && <label>Broken link address<input type="url" value={form.brokenUrl} onChange={(e) => setForm({ ...form, brokenUrl: e.target.value })} /></label>}{!isCalendarType && <label>{changeType === "correction" ? "What should it say instead?" : changeType === "broken_link" ? "Anything else we should know (optional)" : "Details"}<textarea required={changeType !== "broken_link"} rows={4} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} /></label>}{changeType !== "broken_link" && changeType !== "other" && <label>{isCalendarType ? "Source URL" : "Link or source (optional)"}<input type="url" value={form.sourceUrl} onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })} /></label>}<label>Referring page<input readOnly value={form.referringPage} /></label>{error && <p className="error">{error}</p>}<button className="primary" type="submit">Submit suggestion</button></form></section>}
      {screen === "receipt" && <section className="panel narrow"><p className="eyebrow">Received for review</p><h1>Thanks for helping improve AI @ York.</h1><p>Your suggestion has been saved for review in this workspace.</p><div className="receipt"><strong>Reference</strong><code>{receipt?.reference}</code><strong>Private receipt secret</strong><code>{receipt?.receiptSecret}</code></div><button className="primary" onClick={() => chooseRole("admin")}>Switch role</button></section>}
      {screen === "studio" && <StudioShell view={studioView} navigate={setStudioView} exit={() => go(page)}
        content={adminContent} pending={requests.filter((request) => request.status === "received").length}>
        {studioView === "pages" && <PageEditor onPublish={(key, copy) => setPublishedPages((current) => ({ ...current, [key]: copy }))} />}

        {studioView === "inbox" ? <><h1>Requests inbox</h1><p>Review incoming suggestions before they appear publicly.</p><div className="actions"><button onClick={loadRequests}>Refresh inbox</button><button onClick={copyVisitorLink}>Copy visitor link</button></div>{visitorLink && <p className="success">Visitor link copied. It grants public reads and external suggestions, not Studio access.</p>}<div className="request-list">{requests.map((request) => <article className="request" key={request.id}><div><span className="status">{request.status}</span> <span className="status">{changeTypeLabels[request.kind] ?? request.kind}</span><h2>{request.payload.title}</h2><p>{request.kind === "event" || request.kind === "training" ? `${request.payload.date} · ${request.payload.organizer} · ${request.payload.audience}` : [request.payload.pageUrl, request.payload.brokenUrl, request.payload.sourceUrl, request.payload.details].filter(Boolean).join(" · ")}</p></div>{request.status === "received" && <div className="actions">{request.kind === "event" || request.kind === "training" ? <button className="primary" onClick={() => act(request.id)}>Publish to calendar</button> : <button className="primary" onClick={() => act(request.id, "resolve")}>Mark as resolved</button>}<button onClick={() => act(request.id, "decline")}>Decline</button></div>}</article>)}{requests.length === 0 && <p className="empty">No requests loaded. Refresh inbox to check the workspace.</p>}</div></> : studioView === "policy" || studioView === "interpretation" ? <PolicyStudio view={studioView} /> : studioView !== "pages" && studioView !== "overview" && <CmsManager key={studioView} collection={studioView} content={adminContent} reload={loadAdminContent} />}
      </StudioShell>}
    </main><footer><span><strong>AI @ York</strong> · Guidance, tools and community</span><a href="https://www.yorku.ca/ai-at-york/" target="_blank" rel="noreferrer">Visit York University{screen === "studio" && <span aria-hidden="true"> ↗</span>}</a></footer></div>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
