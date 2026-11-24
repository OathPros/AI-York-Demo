import React, { useEffect } from "react";
import { workstreams } from "./workplan-content";
import "./workplan.css";

export function WorkplanPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <article className="workplan" id="workplan-workstreams" aria-labelledby="workplan-workstreams-title">
    <div className="section">
      <h1 id="workplan-workstreams-title">Workstreams</h1>
      <ol className="workplan-streams" role="list">
        {workstreams.map(({ name, objective, tasks, deliverables }, index) => <li className="workplan-stream" key={name}>
          <header>
            <p className="status">Workstream {index + 1}</p>
            <h2>{name}</h2>
          </header>
          <div>
            <h3>{objective}</h3>
            <ul>{tasks.map((task) => <li key={task}>{task}</li>)}</ul>
          </div>
          <div className="workplan-deliverables">
            <h3>{deliverables.length === 1 ? "Deliverable" : "Deliverables"}</h3>
            {deliverables.length === 1 ? <p>{deliverables[0]}</p> :
              <ul>{deliverables.map((item) => <li key={item}>{item}</li>)}</ul>}
          </div>
        </li>)}
      </ol>
    </div>
  </article>;
}
