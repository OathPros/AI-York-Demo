import React from "react";
import type { Activity, ContentBundle, ContentItem } from "@ai-york/contracts";
export { GuidancePage } from "./audience-guides";
import { catalogDescription, isProgram, programLevel, programsForPage, trainingActivities, type ProgramLevel } from "./catalog";
import { PageHeader, ResourceLink } from "./hub";
import { LearningGuide } from "./learning";

const activities: [Activity, string][] = [["study", "Study"], ["work", "Work"], ["research", "Research"], ["teach", "Teaching"]];

function CatalogCards({ items, showLevel = false, training = false }: { items: ContentItem[]; showLevel?: boolean; training?: boolean }) {
  const Title = training ? "h2" : "h3";
  return <div className="grid">{items.map((item) => <article className="card" key={item.id}>
    <span className="status">{showLevel ? (programLevel(item) === "unspecified" ? (item.data.format || "Program resource") : programLevel(item)) : item.data.format}</span>
    <Title>{item.title}</Title>{catalogDescription(item) && <p>{catalogDescription(item)}</p>}
    <ResourceLink href={item.data.url}>Open resource</ResourceLink>
  </article>)}</div>;
}

const practicePaths: { activity: Activity; title: string; exercise: string }[] = [
  { activity: "study", title: "Practise explaining a concept", exercise: "Write a short answer to a practice question, then compare it with a second explanation. Check both against your course notes and identify a point you can explain more clearly." },
  { activity: "teach", title: "Review an assignment brief", exercise: "Take a fictional assignment and ask a colleague to mark where it sets AI expectations and how a student can tell what to acknowledge." },
  { activity: "research", title: "Document a screening decision", exercise: "Pick two public abstracts and record the inclusion criteria, the evidence you found and the reason for each decision." },
  { activity: "work", title: "Review a service reply", exercise: "Compare two replies to a fictional service enquiry. Check for accuracy, a clear next step and a way to reach a person." }
];

export function TrainingPage({ content, activity, activities: selection }: { content: ContentBundle; activity?: Activity; activities?: Activity[] }) {
  const selected = selection?.length ? selection : activity ? [activity] : [];
  const items = content.training.filter((item) => !isProgram(item) && (!selected.length || trainingActivities(item).some((value) => selected.includes(value))));
  return <div className="training-page">
    <LearningGuide />
    <section className="section catalog-practice" aria-labelledby="practice-paths">
      <h2 id="practice-paths">Try a practice exercise</h2>
      {practicePaths.filter((path) => !selected.length || selected.includes(path.activity)).map((path) => <details key={path.activity}>
        <summary>{path.title}</summary>
        <p>{path.exercise}</p>
        <a className="text-link" href={`#/guidance?activity=${path.activity}`}>Read related guidance</a>
      </details>)}
      <p><a className="text-link" href="#/events">Find workshops on the calendar</a></p>
    </section>
    <section className="section" aria-label="Training resources">
      <h2>Browse training</h2>
      <nav className="filters catalog-filters" aria-label="Filter training by activity">
        <a href="#/training" aria-current={selected.length === 0 ? "page" : undefined}>All training</a>
        {activities.map(([value, label]) => <a key={value} href={`#/training?activity=${value}`} aria-current={selected.length === 1 && selected[0] === value ? "page" : undefined}>{label}</a>)}
      </nav>
      {selected.length > 1 && <p>Showing resources for {activities.filter(([value]) => selected.includes(value)).map(([, label]) => label).join(", ")}</p>}
      <CatalogCards items={items} training />
      {items.length === 0 && <p className="empty" role="status">No training is currently classified for this activity.</p>}
      <p>Looking for a degree or certificate? <a className="text-link" href="#/programs">Explore programs</a>.</p>
    </section>
  </div>;
}

const levels: [Exclude<ProgramLevel, "unspecified">, string][] = [["undergraduate", "Undergraduate"], ["graduate", "Graduate"], ["certificate", "Certificates"]];

export function ProgramsPage({ content, level }: { content: ContentBundle; level?: Exclude<ProgramLevel, "unspecified"> }) {
  const items = programsForPage(content.training).filter((item) => !level || programLevel(item) === level);
  return <div className="programs-page">
    <PageHeader eyebrow="Formal study" title="AI programs" intro="Explore degrees and certificates. Check each program's official page for admission and current details." />
    <section className="section" aria-labelledby="programs-title">
      <h2 id="programs-title">Degrees and certificates</h2>
      <nav className="filters catalog-filters" aria-label="Filter programs by level">
        <a href="#/programs" aria-current={!level ? "page" : undefined}>All programs</a>
        {levels.map(([value, label]) => <a key={value} href={`#/programs?level=${value}`} aria-current={level === value ? "page" : undefined}>{label}</a>)}
      </nav>
      <CatalogCards items={items} showLevel />
      {items.length === 0 && <p className="empty" role="status">No programs are currently classified at this level. Browse all programs for listings with an unspecified level.</p>}
    </section>
  </div>;
}
