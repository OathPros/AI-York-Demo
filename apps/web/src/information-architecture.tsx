import React from "react";
import type { Activity, ContentBundle, ContentItem } from "@ai-york/contracts";
import { AudienceGuide } from "./audience-guides";
import { isProgram, programLevel, trainingActivities, type ProgramLevel } from "./catalog";
import { GuideFinder, PageHeader, ResourceLink } from "./hub";
import { LearningGuide } from "./learning";
import type { PublishedPages } from "./page-copy";

const activities: [Activity, string][] = [["study", "Study"], ["work", "Work"], ["research", "Research"], ["teach", "Teaching"]];

export function GuidancePage({ content, activity, copies }: { content: ContentBundle; activity?: Activity; copies: PublishedPages }) {
  return <div className="guidance-page">
    <PageHeader eyebrow="Guidance" title="Guidance for using AI" intro="Explore practical guidance by activity, or check a specific task and the information involved." />
    <section className="section" aria-labelledby="guidance-activity">
      <h2 id="guidance-activity">Choose an activity</h2>
      <nav className="filters catalog-filters" aria-label="Guidance activity">
        <a href="#/guidance" aria-current={!activity ? "page" : undefined}>All activities</a>
        {activities.map(([value, label]) => <a key={value} href={`#/guidance?activity=${value}`} aria-current={activity === value ? "page" : undefined}>{label}</a>)}
      </nav>
      {!activity && <p>Select an activity to explore its detailed guidance below, or use the scenario finder.</p>}
    </section>
    <GuideFinder key={activity ?? "all"} content={content} initial={activity ? [activity] : []} />
    {activity && <AudienceGuide key={activity} kind={activity} copy={copies[activity]} embedded />}
  </div>;
}

function CatalogCards({ items, showLevel = false }: { items: ContentItem[]; showLevel?: boolean }) {
  return <div className="grid">{items.map((item) => <article className="card" key={item.id}>
    <span className="status">{showLevel ? (programLevel(item) === "unspecified" ? "Level not specified" : programLevel(item)) : item.data.format}</span>
    <h3>{item.title}</h3>{item.data.summary && <p>{item.data.summary}</p>}
    <ResourceLink href={item.data.url}>Open resource</ResourceLink>
  </article>)}</div>;
}

export function TrainingPage({ content, activity }: { content: ContentBundle; activity?: Activity }) {
  const items = content.training.filter((item) => !isProgram(item) && (!activity || trainingActivities(item).includes(activity)));
  return <div className="training-page">
    <LearningGuide />
    <section className="section" aria-labelledby="training-catalog-title">
      <h2 id="training-catalog-title">Courses, workshops and resources</h2>
      <nav className="filters catalog-filters" aria-label="Filter training by activity">
        <a href="#/training" aria-current={!activity ? "page" : undefined}>All training</a>
        {activities.map(([value, label]) => <a key={value} href={`#/training?activity=${value}`} aria-current={activity === value ? "page" : undefined}>{label}</a>)}
      </nav>
      <CatalogCards items={items} />
      {items.length === 0 && <p className="empty" role="status">No training is currently classified for this activity.</p>}
      <p>Looking for a degree or certificate? <a className="text-link" href="#/programs">Explore programs</a>.</p>
    </section>
  </div>;
}

const levels: [Exclude<ProgramLevel, "unspecified">, string][] = [["undergraduate", "Undergraduate"], ["graduate", "Graduate"], ["certificate", "Certificates"]];

export function ProgramsPage({ content, level }: { content: ContentBundle; level?: Exclude<ProgramLevel, "unspecified"> }) {
  const items = content.training.filter((item) => isProgram(item) && (!level || programLevel(item) === level));
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
