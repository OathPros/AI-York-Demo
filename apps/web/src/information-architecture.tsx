import React, { useState } from "react";
import type { Activity, ContentBundle, ContentItem } from "@ai-york/contracts";
export { GuidancePage } from "./audience-guides";
import { catalogDescription, isProgram, programLevel, programsForPage, trainingActivities, type ProgramLevel } from "./catalog";
import { ResourceLink } from "./hub";
import { Icon, PhotoHero } from "./public-ui";
import learningImage from "./assets/banners/study.webp";
import campusImage from "./assets/banners/partner.webp";

const activities: [Activity, string][] = [["study", "Study"], ["work", "Work"], ["research", "Research"], ["teach", "Teaching"]];

function CatalogList({ items, programs = false }: { items: ContentItem[]; programs?: boolean }) {
  const Title = programs ? "h2" : "h3";
  return <div className="academic-list">{items.map((item) => {
    const credential = levels.find(([key]) => key === programLevel(item))?.[1];
    return <article className="academic-entry" key={item.id}>
      <p className="status">{item.data.format || (programs ? credential ?? "Program resource" : "Training resource")}</p>
      <div><Title>{item.title}</Title>{catalogDescription(item) && <p>{catalogDescription(item)}</p>}</div>
      <ResourceLink href={item.data.url}>{programs ? "Official program page" : "Open resource"}<span className="visually-hidden"> for {item.title}</span></ResourceLink>
    </article>;
  })}</div>;
}

const practicePaths: { activity: Activity; title: string; exercise: string; review: string }[] = [
  { activity: "study", title: "Explain a concept", exercise: "Write a short answer to a practice question, then compare it with a second explanation. Check both against your course notes and identify a point you can explain more clearly.", review: "Rewrite that point in your own words and note which course source supports it." },
  { activity: "teach", title: "Review an assignment brief", exercise: "Take a fictional assignment and ask a colleague to mark where it sets AI expectations and how a student can tell what to acknowledge.", review: "Check whether a student could distinguish AI use allowed for practice from what they can submit for assessment." },
  { activity: "research", title: "Document a screening decision", exercise: "Pick two public abstracts and record the inclusion criteria, the evidence you found and the reason for each decision.", review: "Check whether a second reviewer could reach the same decision using only the criteria and evidence you recorded." },
  { activity: "work", title: "Review a service reply", exercise: "Compare two replies to a fictional service enquiry. Check for accuracy, a clear next step and a way to reach a person.", review: "Identify a sentence you would keep, one you would revise, and any detail you would verify before sending." }
];

function PracticeExercise({ path }: { path: (typeof practicePaths)[number] }) {
  const [review, setReview] = useState(false);
  return <div className="practice-body" key={path.activity}>
    <p className="status">{review ? "Review" : "Exercise"}</p>
    <h3>{path.title}</h3>
    <p>{review ? path.review : path.exercise}</p>
    <div className="inline-actions">
      <button type="button" className="button secondary" onClick={() => setReview(!review)}>{review ? "Return to exercise" : "Review your work"}</button>
      <a className="text-link" href={`#/guidance?activity=${path.activity}`}>Related guidance</a>
    </div>
  </div>;
}

export function TrainingPage({ content, activity, activities: selection }: { content: ContentBundle; activity?: Activity; activities?: Activity[] }) {
  const selected = selection?.length ? selection : activity ? [activity] : [];
  const [topic, setTopic] = useState("");
  const items = content.training.filter((item) => !isProgram(item) &&
    (!selected.length || trainingActivities(item).some((value) => selected.includes(value))) &&
    (!topic || item.data.tags?.includes(topic)));
  const paths = practicePaths.filter((path) => !selected.length || selected.includes(path.activity));
  const [exercise, setExercise] = useState<Activity>();
  const path = paths.find((item) => item.activity === exercise) ?? paths[0];
  return <div className="training-page">
    <PhotoHero className="learning-hero" image={learningImage} id="training-title">
      <h1 id="training-title">AI training at York</h1>
      <p className="lead">Develop practical AI skills for your courses, classroom, research or work.</p>
    </PhotoHero>
    <section className="shell practice-workspace" aria-labelledby="practice-paths">
      <div className="practice-picker">
        <h2 id="practice-paths">Practice lab</h2>
        <div className="practice-options" role="group" aria-label="Practice exercises">
          {paths.map((item) => <button type="button" key={item.activity} aria-pressed={item === path} onClick={() => setExercise(item.activity)}>{item.title}<Icon name="next" /></button>)}
        </div>
      </div>
      <PracticeExercise key={path.activity} path={path} />
    </section>
    <section className="section training-library" aria-labelledby="training-library-title">
      <div className="listing-head"><h2 id="training-library-title">Training library</h2><a className="text-link" href="#/events">Upcoming workshops</a></div>
      <nav className="filters catalog-filters" aria-label="Filter training by activity">
        <a href="#/training" aria-current={selected.length === 0 ? "page" : undefined}>All training</a>
        {activities.map(([value, label]) => <a key={value} href={`#/training?activity=${value}`} aria-current={selected.length === 1 && selected[0] === value ? "page" : undefined}>{label}</a>)}
      </nav>
      {selected.length > 1 && <p className="status">{activities.filter(([value]) => selected.includes(value)).map(([, label]) => label).join(" · ")}</p>}
      <div className="updates-filters"><label>Focus<select value={topic} onChange={(event) => setTopic(event.target.value)}>
        <option value="">All resources</option><option value="basics">Getting started</option><option value="tools">Tool how-tos</option>
      </select></label></div>
      <CatalogList items={items} />
      {items.length === 0 && <p className="empty" role="status">No training matches these filters.</p>}
      <p><a className="text-link" href="#/programs">Explore degrees and certificates</a></p>
    </section>
  </div>;
}

const levels: [Exclude<ProgramLevel, "unspecified">, string][] = [["undergraduate", "Undergraduate"], ["graduate", "Graduate"], ["certificate", "Certificates"]];

export function ProgramsPage({ content, level }: { content: ContentBundle; level?: Exclude<ProgramLevel, "unspecified"> }) {
  const items = programsForPage(content.training).filter((item) => !level || programLevel(item) === level);
  return <div className="programs-page">
    <header className="academic-intro">
      <div className="shell academic-cover"><div>
        <h1>AI programs</h1>
        <p className="lead">Explore York degrees and certificates and find official admissions information.</p>
      </div><img src={campusImage} alt="" /></div>
    </header>
    <section className="section" aria-label="Program listings">
      <nav className="filters catalog-filters" aria-label="Filter programs by level">
        <a href="#/programs" aria-current={!level ? "page" : undefined}>All programs</a>
        {levels.map(([value, label]) => <a key={value} href={`#/programs?level=${value}`} aria-current={level === value ? "page" : undefined}>{label}</a>)}
      </nav>
      <CatalogList items={items} programs />
      {items.length === 0 && <p className="empty" role="status">No programs are currently classified at this level. Browse all programs for listings with an unspecified level.</p>}
    </section>
  </div>;
}
