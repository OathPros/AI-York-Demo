import React, { useEffect, useState } from "react";
import { contentCollections, editablePageSchema, type ContentBundle, type ContentCollection, type ContentItem, type ContentStatus, type EditablePage, type PageCopy } from "@ai-york/contracts";
import { api } from "./api";
import { pageCopy } from "./page-copy";
import { programLevel, trainingActivities } from "./catalog";

export type StudioView = "overview" | "pages" | "inbox" | ContentCollection;
const inventoryLabels: Record<ContentCollection, string> = {
  policy: "POLICY", interpretation: "Interpretations", tool: "Tools", event: "Events",
  community: "Communities", training: "Training"
};

export function StudioShell({ view, navigate, exit, content, pending, children }: {
  view: StudioView; navigate: (view: StudioView) => void; exit: () => void;
  content: ContentBundle; pending: number; children: React.ReactNode;
}) {
  const entries = Object.values(content).flat();
  const navigation = (target: StudioView, label: string) => <button key={target} type="button"
    aria-current={target === view ? "page" : undefined} onClick={() => navigate(target)}>{label}</button>;
  return <div className="studio-workspace">
    <nav className="studio-sidebar" aria-label="Studio navigation">
      <strong>AI @ York Studio</strong>
      {navigation("overview", "Overview")}
      {navigation("pages", "Site pages")}
      {navigation("inbox", "Requests inbox")}
      <p>Content</p>
      {contentCollections.map((name) => navigation(name, inventoryLabels[name]))}
    </nav>
    <div className="studio-main">
      <div className="studio-top"><span>Demo workspace</span><button onClick={exit}>View site</button></div>
      {view === "overview" ? <>
        <h1>Studio overview</h1>
        <p>Update page introductions, manage resources and review suggestions</p>
        <div className="studio-metrics">
          <button onClick={() => navigate("pages")}><strong>{editablePageSchema.options.length}</strong> Site pages</button>
          <button onClick={() => navigate("policy")}><strong>{entries.filter((item) => item.status === "published").length}</strong> Published resources across inventories</button>
          <button onClick={() => navigate("inbox")}><strong>{pending}</strong> Suggestions to review</button>
        </div>
        <h2>Manage site content</h2>
        <div className="studio-directory">{contentCollections.map((name) => navigation(name, inventoryLabels[name]))}</div>
      </> : children}
    </div>
  </div>;
}

export function PolicyStudio({ view }: { view: "policy" | "interpretation" }) {
  const url = `${import.meta.env.BASE_URL}policy-studio.html?view=${view}`;
  return <section aria-label="Policy Studio demonstration">
    <h1>{view === "policy" ? "Policy Studio" : "Interpretation Studio"}</h1>
    <p>This separate demonstration stores changes in this browser only. It does not update the site's published policies or guidance.</p>
    <iframe className="policy-studio-frame" title="Policy and interpretation demonstration" src={url} />
  </section>;
}

type PageVersions = { draft: PageCopy; published: PageCopy | null };

export function PageEditor({ onPublish }: { onPublish: (page: EditablePage, copy: PageCopy) => void }) {
  const [page, setPage] = useState<EditablePage>("home");
  const [versions, setVersions] = useState<Partial<Record<EditablePage, PageVersions>>>();
  const [copy, setCopy] = useState(pageCopy.home);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    api("/api/v1/studio/pages").then(({ pages }) => {
      if (!active) return;
      setVersions(pages);
      setCopy(pages.home?.draft ?? pageCopy.home);
    }).catch((reason: Error) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, []);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const publish = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "publish";
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const result = await api(`/api/v1/studio/pages/${page}`, {
        method: "PUT", body: JSON.stringify({ copy, publish })
      });
      const saved: PageCopy = result.copy;
      setVersions((current) => ({ ...current, [page]: { draft: saved, published: publish ? saved : current?.[page]?.published ?? null } }));
      setCopy(saved);
      if (publish) onPublish(page, saved);
      setFeedback(publish ? "Published to this workspace" : "Draft saved");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this page");
    } finally {
      setSaving(false);
    }
  };

  return <>
    <h1>Site pages</h1>
    <p>Edit the title and introduction visitors see at the top of each page</p>
    {error && <p className="error" role="alert">{error}</p>}
    {feedback && <p role="status">{feedback}</p>}
    <form className="studio-page-form" onSubmit={save}>
      <fieldset disabled={!versions || saving}>
        <label>Page<select value={page} onChange={(event) => {
          const next = editablePageSchema.parse(event.target.value);
          setPage(next);
          setCopy(versions?.[next]?.draft ?? pageCopy[next]);
          setFeedback("");
          setError("");
        }}>{editablePageSchema.options.map((name) => <option key={name} value={name}>{name === "home" ? "Homepage" : pageCopy[name].title}</option>)}</select></label>
        <label>Page title<input required minLength={2} maxLength={120} value={copy.title} onChange={(event) => setCopy({ ...copy, title: event.target.value })} /></label>
        <label>Introduction<textarea required minLength={10} maxLength={900} rows={5} value={copy.intro} onChange={(event) => setCopy({ ...copy, intro: event.target.value })} /></label>
        <div className="actions"><button type="submit" value="draft">Save draft</button><button className="primary" type="submit" value="publish">Publish to workspace</button></div>
      </fieldset>
      <section className="studio-preview" aria-label="Page copy preview">
        <p>Preview</p><h2>{copy.title}</h2><p>{copy.intro}</p>
      </section>
    </form>
  </>;
}

type Option = { value: string; label: string };
type Field = { key: string; label: string; kind: "text" | "textarea" | "url" | "date" | "time" | "checkbox" | "select" | "multi"; options?: Option[] | ((content: ContentBundle) => Option[]); required?: boolean };

const activityOptions: Option[] = [{ value: "study", label: "Study" }, { value: "teach", label: "Teach" }, { value: "research", label: "Research" }, { value: "work", label: "Work" }];
const activityField: Field = { key: "activities", label: "Applies to", kind: "multi", options: activityOptions };

export const collectionMeta: Record<ContentCollection, { label: string; single: string; hint: string; fields: Field[] }> = {
  policy: { label: "Policy inventory", single: "policy", hint: "Policies, directives and guidelines that guidance points back to.", fields: [
    { key: "title", label: "Title", kind: "text", required: true }, { key: "summary", label: "Plain-language summary", kind: "textarea" }, { key: "url", label: "Authoritative source URL", kind: "url" },
    { key: "owner", label: "Owner", kind: "text" }, { key: "effectiveDate", label: "Effective date", kind: "text" }, activityField] },
  interpretation: { label: "Interpretation inventory", single: "interpretation", hint: "Guidance for an activity, task and information type: what is acceptable, conditional and not acceptable.", fields: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "activity", label: "Activity", kind: "select", options: activityOptions, required: true },
    { key: "task", label: "Task key", kind: "text", required: true }, { key: "taskLabel", label: "Task label shown to visitors", kind: "text" },
    { key: "data", label: "Information type", kind: "select", options: [{ value: "none", label: "General" }, { value: "public", label: "Public" }, { value: "internal", label: "Internal York" }, { value: "sensitive", label: "Sensitive" }, { value: "unsure", label: "Unsure" }], required: true },
    { key: "example_use", label: "Example use", kind: "textarea" }, { key: "green", label: "Generally acceptable", kind: "textarea" }, { key: "yellow", label: "Conditions before use", kind: "textarea" }, { key: "red", label: "Not acceptable", kind: "textarea" },
    { key: "tool_advice", label: "Tool advice", kind: "textarea" },
    { key: "tool_ids", label: "Approved tools", kind: "multi", options: (c) => c.tool.map((t) => ({ value: t.id, label: t.title })) },
    { key: "sources", label: "Policy and sources", kind: "multi", options: (c) => c.policy.map((p) => ({ value: p.id, label: p.title })) },
    { key: "approval_note", label: "Approval note", kind: "textarea" }] },
  tool: { label: "Tool inventory", single: "tool", hint: "York-approved tools and who can access them.", fields: [
    { key: "name", label: "Name", kind: "text", required: true }, { key: "url", label: "Access URL", kind: "url" }, { key: "scope", label: "What it is and its limits", kind: "textarea" },
    { key: "audience", label: "Audience", kind: "select", options: [{ value: "all", label: "Students, faculty and staff" }, { value: "students", label: "Students" }, { value: "staff", label: "Faculty and staff" }], required: true }, activityField] },
  event: { label: "Event inventory", single: "event", hint: "Events and trainings on the calendar.", fields: [
    { key: "type", label: "Type", kind: "select", options: [{ value: "event", label: "Event" }, { value: "training", label: "Training or workshop" }], required: true },
    { key: "title", label: "Title", kind: "text", required: true }, { key: "date", label: "Date", kind: "date", required: true }, { key: "allDay", label: "All day", kind: "checkbox" },
    { key: "startTime", label: "Start time", kind: "time" }, { key: "endTime", label: "End time", kind: "time" }, { key: "timezone", label: "Timezone", kind: "text", required: true },
    { key: "organizer", label: "Organizer", kind: "text", required: true }, { key: "audience", label: "Audience", kind: "text", required: true }, { key: "location", label: "Location", kind: "text" },
    { key: "onlineLink", label: "Online link", kind: "url" }, { key: "sourceUrl", label: "Source URL", kind: "url" }, { key: "summary", label: "Summary", kind: "textarea" }, activityField] },
  community: { label: "Community inventory", single: "community", hint: "Groups people can join and share practice with.", fields: [
    { key: "name", label: "Name", kind: "text", required: true }, { key: "summary", label: "Description", kind: "textarea" }, { key: "url", label: "Joining link", kind: "url" }, { key: "contact", label: "Contact", kind: "text" }, activityField] },
  training: { label: "Training inventory", single: "training", hint: "Courses, workshops, guides and credentials.", fields: [
    { key: "title", label: "Title", kind: "text", required: true }, { key: "summary", label: "Description", kind: "textarea" }, { key: "url", label: "Link", kind: "url" }, { key: "format", label: "Format", kind: "text" },
    activityField,
    { key: "tags", label: "Resource topics and type", kind: "multi", options: [{ value: "basics", label: "Getting started" }, { value: "work", label: "Administrative / work" }, { value: "teach", label: "Teaching" }, { value: "study", label: "Study" }, { value: "tools", label: "Tool how-tos" }, { value: "partner", label: "Program or certificate" }] },
    { key: "programLevel", label: "Program level (when applicable)", kind: "select", options: [{ value: "unspecified", label: "Not specified" }, { value: "undergraduate", label: "Undergraduate" }, { value: "graduate", label: "Graduate" }, { value: "certificate", label: "Certificate" }] }] }
};

const defaults = (collection: ContentCollection): Record<string, unknown> => {
  const values: Record<string, unknown> = {};
  for (const field of collectionMeta[collection].fields) {
    const first = Array.isArray(field.options) ? field.options[0]?.value : undefined;
    values[field.key] = field.kind === "multi" ? [] : field.kind === "checkbox" ? false : field.kind === "select" ? first ?? "" : "";
  }
  if (collection === "event") Object.assign(values, { timezone: "America/Toronto", organizer: "AI @ York", audience: "York community" });
  return values;
};

type Editing = { id: string | null; status: ContentStatus; values: Record<string, unknown> };

export function CmsManager({ collection, content, reload }: { collection: ContentCollection; content: ContentBundle; reload: () => Promise<void> }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const meta = collectionMeta[collection];
  const items = content[collection].filter((item) => (!status || item.status === status) && item.title.toLowerCase().includes(query.trim().toLowerCase()));

  const open = (item: ContentItem | null) => { setMessage(""); setError(""); setEditing(item ? { id: item.id, status: item.status === "archived" ? "draft" : item.status, values: { ...defaults(collection), ...item.data, ...(collection === "training" ? { activities: trainingActivities(item), programLevel: programLevel(item) } : {}) } } : { id: null, status: "draft", values: defaults(collection) }); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    setError(""); setMessage("");
    const data = { ...editing.values };
    if (collection === "event") for (const key of ["startTime", "endTime"]) if (data.allDay || !data[key]) delete data[key];
    try {
      await api(editing.id ? `/api/v1/studio/content/${collection}/${encodeURIComponent(editing.id)}` : `/api/v1/studio/content/${collection}`, { method: editing.id ? "PUT" : "POST", body: JSON.stringify({ status: editing.status, data }) });
      await reload();
      setMessage(editing.status === "published" ? "Saved and published." : "Saved as a draft.");
      setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save."); }
  };
  const archive = async (item: ContentItem) => {
    setError(""); setMessage("");
    try { await api(`/api/v1/studio/content/${collection}/${encodeURIComponent(item.id)}`, { method: "DELETE" }); await reload(); setMessage(`Archived "${item.title}".`); } catch (e) { setError(e instanceof Error ? e.message : "Could not archive."); }
  };
  const set = (key: string, value: unknown) => setEditing((current) => (current ? { ...current, values: { ...current.values, [key]: value } } : current));

  const renderField = (field: Field) => {
    if (!editing) return null;
    const value = editing.values[field.key];
    const options = typeof field.options === "function" ? field.options(content) : field.options ?? [];
    const id = `cms-${field.key}`;
    if (field.kind === "checkbox") return <label key={field.key} className="check"><input type="checkbox" checked={Boolean(value)} onChange={(e) => set(field.key, e.target.checked)} /> {field.label}</label>;
    if (field.kind === "multi") return <fieldset key={field.key} className="multi"><legend>{field.label}</legend><div className="choices">{options.map((option) => { const list = (value as string[]) ?? []; return <label key={option.value} className="choice"><input type="checkbox" checked={list.includes(option.value)} onChange={(e) => set(field.key, e.target.checked ? [...list, option.value] : list.filter((v) => v !== option.value))} /> {option.label}</label>; })}</div></fieldset>;
    if (field.kind === "select") return <label key={field.key} htmlFor={id}>{field.label}<select id={id} value={String(value ?? "")} onChange={(e) => set(field.key, e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
    if (field.kind === "textarea") return <label key={field.key} htmlFor={id}>{field.label}<textarea id={id} rows={4} value={String(value ?? "")} onChange={(e) => set(field.key, e.target.value)} /></label>;
    return <label key={field.key} htmlFor={id}>{field.label}<input id={id} type={field.kind === "text" ? "text" : field.kind} required={field.required} value={String(value ?? "")} onChange={(e) => set(field.key, e.target.value)} /></label>;
  };

  return (
    <div className="cms">
      <h1>{inventoryLabels[collection]}</h1>
      <p>{meta.hint}</p>
      <div className="two">
        <label>Search by title<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option>
        </select></label>
      </div>
      <div className="actions"><button className="primary" onClick={() => open(null)}>Add {meta.single}</button></div>
      {message && <p className="success" role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      {editing && <form className="cms-form" onSubmit={save}><h2>{editing.id ? `Edit ${meta.single}` : `New ${meta.single}`}</h2>{meta.fields.map(renderField)}<label>Status<select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as ContentStatus })}><option value="draft">Draft (not public)</option><option value="published">Published</option></select></label><div className="actions"><button className="primary" type="submit">Save {meta.single}</button><button type="button" onClick={() => setEditing(null)}>Cancel</button></div></form>}
      <div className="request-list">{items.map((item) => <article className="request" key={item.id}><div><span className="status">{item.status}</span> <span className="status">{item.origin === "base" ? "shared seed" : "edited in this workspace"}</span><h3>{item.title}</h3></div>{item.status !== "archived" && <div className="actions"><button onClick={() => open(item)}>Edit</button><button onClick={() => archive(item)}>Archive</button></div>}{item.status === "archived" && <button onClick={() => open(item)}>Restore as draft</button>}</article>)}{items.length === 0 && <p className="empty">Nothing here yet. Add the first {meta.single}.</p>}</div>
    </div>
  );
}
