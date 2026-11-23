import React from "react";
import type { Activity, ContentBundle, ContentItem } from "@ai-york/contracts";
import { AudienceGuide } from "./audience-guides";
import { catalogDescription, isProgram, programLevel, programsForPage, trainingActivities, type ProgramLevel } from "./catalog";
import { PageHeader, ResourceLink } from "./hub";
import { LearningGuide } from "./learning";
import type { PublishedPages } from "./page-copy";

const activities: [Activity, string][] = [["study", "Study"], ["work", "Work"], ["research", "Research"], ["teach", "Teaching"]];

export function GuidancePage({ activity, copies }: { activity?: Activity; copies: PublishedPages }) {
  const selected = activity ?? "study";
  return <div className="guidance-page">
    <div className="guidance-selector"><div className="shell">
      <p>Guidance for your activity</p>
      <nav className="catalog-filters" aria-label="Guidance activity">
        {activities.map(([value, label]) => <a key={value} href={`#/guidance?activity=${value}`} aria-current={selected === value ? "page" : undefined}>{label}</a>)}
      </nav>
      <a className="text-link" href={`#/guide?activity=${selected}`}>Check a specific use of AI</a>
      <p className="guidance-selector__note">Curated from linked sources; check them for the latest guidance.</p>
    </div></div>
    <AudienceGuide key={selected} kind={selected} copy={copies[selected]} />
  </div>;
}

function CatalogCards({ items, showLevel = false, training = false }: { items: ContentItem[]; showLevel?: boolean; training?: boolean }) {
  const Title = training ? "h2" : "h3";
  return <div className="grid">{items.map((item) => <article className="card" key={item.id}>
    <span className="status">{showLevel ? (programLevel(item) === "unspecified" ? (item.data.format || "Program resource") : programLevel(item)) : item.data.format}</span>
    <Title>{item.title}</Title>{catalogDescription(item) && <p>{catalogDescription(item)}</p>}
    <ResourceLink href={item.data.url}>Open resource</ResourceLink>
  </article>)}</div>;
}

export function TrainingPage({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.training.filter((item) => !isProgram(item) && (!activity || trainingActivities(item).includes(activity)));
  return <div className="training-page">
    <LearningGuide />
    <section className="section" aria-label="Training resources">
      <nav className="filters catalog-filters" aria-label="Filter training by activity">
        <a href="#/training" aria-current={!activity ? "page" : undefined}>All training</a>
        {activities.map(([value, label]) => <a key={value} href={`#/training?activity=${value}`} aria-current={activity === value ? "page" : undefined}>{label}</a>)}
      </nav>
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
