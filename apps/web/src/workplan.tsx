import React, { useEffect } from "react";
import { backbone, contentModel, dependencies, operatingModel, outcomes, workstreams } from "./workplan-content";
import "./workplan.css";

const sections = [
  ["backbone", "Program backbone"],
  ["workstreams", "Workstreams"],
  ["content-model", "Content model"],
  ["operating-model", "Operating model"],
  ["dependencies", "Dependencies"],
  ["outcomes", "Success measures"]
];

export function WorkplanPage({ section }: { section?: string }) {
  useEffect(() => {
    if (!section) {
      window.scrollTo(0, 0);
      return;
    }
    const target = document.getElementById(`workplan-${section}`);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView();
  }, [section]);

  return <article className="workplan">
    <header className="workplan-cover">
      <div className="shell">
        <p className="eyebrow">Next steps</p>
        <h1>From scattered AI content to one maintained service</h1>
        <p className="lead">The work is not just a website migration. We first define what York needs to answer, then consolidate what already exists, fill the gaps, structure the content, automate maintenance, and connect policy to guidance</p>
        <div className="inline-actions"><a className="button secondary" href="#/home">Open vision demo</a></div>
      </div>
    </header>

    <section className="shell workplan-decision" aria-labelledby="workplan-decision-title">
      <h2 id="workplan-decision-title">Immediate decision</h2>
      <div>
        <p>Approve <strong>Workstream 1: Band-Aid</strong> and authorize <strong>Workstream 2: Inventory &amp; Architecture</strong></p>
        <p>The Inventory of Need becomes the basis for migration, new guidance, search, automation and Studio</p>
      </div>
    </section>

    <nav className="shell workplan-index filters" aria-label="Workplan sections">
      {sections.map(([id, label]) => <a key={id} href={`#/next-steps?section=${id}`} aria-current={section === id ? "location" : undefined}>{label}</a>)}
    </nav>

    <section id="workplan-backbone" className="section workplan-backbone" tabIndex={-1} aria-labelledby="workplan-backbone-title">
      <h2 id="workplan-backbone-title">One backbone for the whole program</h2>
      <ol className="workplan-flow">
        {backbone.map(([title, description]) => <li key={title}>
          <h3>{title}</h3>
          <p>{description}</p>
        </li>)}
      </ol>
    </section>

    <section id="workplan-workstreams" className="workplan-band" tabIndex={-1} aria-labelledby="workplan-workstreams-title">
      <div className="section">
        <h2 id="workplan-workstreams-title">Workstreams</h2>
        <ol className="workplan-streams">
          {workstreams.map(({ name, objective, tasks, deliverables }, index) => <li className="workplan-stream" key={name}>
            <header>
              <p className="status">Workstream {index + 1}</p>
              <h3>{name}</h3>
            </header>
            <div>
              <h4>{objective}</h4>
              <ul>{tasks.map((task) => <li key={task}>{task}</li>)}</ul>
            </div>
            <div className="workplan-deliverables">
              <h4>{deliverables.length === 1 ? "Deliverable" : "Deliverables"}</h4>
              {deliverables.length === 1 ? <p>{deliverables[0]}</p> :
                <ul>{deliverables.map((item) => <li key={item}>{item}</li>)}</ul>}
            </div>
          </li>)}
        </ol>
      </div>
    </section>

    <section id="workplan-content-model" className="section" tabIndex={-1} aria-labelledby="workplan-content-model-title">
      <h2 id="workplan-content-model-title">The content model</h2>
      <p className="lead" id="workplan-content-model-intro">This is the record that connects the inventory, migration, GUIDANCE, search, automation and Studio</p>
      <table className="workplan-model" aria-labelledby="workplan-content-model-title" aria-describedby="workplan-content-model-intro">
        <thead><tr><th scope="col">Field</th><th scope="col">What it controls</th><th scope="col">Example</th></tr></thead>
        <tbody>
          {contentModel.map(([field, control, example]) => <tr key={field}><th scope="row">{field}</th><td>{control}</td><td>{example}</td></tr>)}
        </tbody>
      </table>
    </section>

    <section id="workplan-operating-model" className="workplan-band" tabIndex={-1} aria-labelledby="workplan-operating-title">
      <div className="section">
        <h2 id="workplan-operating-title">Operating model</h2>
        <div className="workplan-operating">
          {operatingModel.map(({ title, entries }) => <section key={title}>
            <h3>{title}</h3>
            <dl>{entries.map(([term, description]) => <div key={term}><dt>{term}</dt><dd>{description}</dd></div>)}</dl>
          </section>)}
        </div>
      </div>
    </section>

    <section id="workplan-dependencies" className="workplan-dependencies" tabIndex={-1} aria-labelledby="workplan-dependencies-title">
      <div className="section">
        <h2 id="workplan-dependencies-title">Key dependencies</h2>
        <ol>{dependencies.map(([title, description]) => <li key={title}><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </div>
    </section>

    <section id="workplan-outcomes" className="section" tabIndex={-1} aria-labelledby="workplan-outcomes-title">
      <h2 id="workplan-outcomes-title">How we know it worked</h2>
      <dl className="workplan-outcomes">
        {outcomes.map(([title, description]) => <div key={title}><dt>{title}</dt><dd>{description}</dd></div>)}
      </dl>
    </section>

    <section className="workplan-band workplan-close" aria-labelledby="workplan-structure-title">
      <div className="section">
        <h2 id="workplan-structure-title">Program structure</h2>
        <ol className="workplan-structure">
          {["AI @ York Work Program", "Workstreams", "Work Packages", "Deliverables"].map((level) => <li key={level}>{level}</li>)}
        </ol>
        <p>Workstreams are ordered by dependency, but some work can overlap once prerequisites are complete</p>
        <p className="quiet">Proposed work program for leadership discussion</p>
      </div>
    </section>
  </article>;
}
