import React, { useEffect, useRef, useState } from "react";
import type { ContentBundle } from "@ai-york/contracts";
import { GroupCards, GroupOverview, formatDate, groupById, type Group } from "./governance-groups";
import "./policies-reports.css";
import communityImage from "./assets/banners/teach.webp";
import { groupRecords, groupRecordHref } from "./demo-records";

type DocumentRecord = {
  title: string;
  publisher: string;
  overview: string;
  url: string;
  kind: "Policy" | "Guideline" | "Report";
  format: "PDF" | "Web page";
  section?: string;
};

const policies: DocumentRecord[] = [
  {
    title: "Information Security Policy",
    publisher: "York University Secretariat",
    overview: "Sets out how York protects institutional information and data and who is responsible for handling it appropriately",
    url: "https://www.yorku.ca/secretariat/policies/policies/information-security-policy/",
    kind: "Policy",
    format: "Web page",
    section: "post-4845"
  },
  {
    title: "Senate Policy on Computing and Information Technology Facilities",
    publisher: "York University Secretariat",
    overview: "Sets expectations for using York computing and information technology facilities, including the responsibilities of users",
    url: "https://www.yorku.ca/secretariat/policies/policies/computing-and-information-technology-facilities-senate-policy/",
    kind: "Policy",
    format: "Web page",
    section: "post-5582"
  },
  {
    title: "Principles and Guidelines for Use of Generative Artificial Intelligence",
    publisher: "York University Office of the CIO",
    overview: "Explains how to use generative AI for administrative work, with guidance on tool choice, data handling and human review",
    url: "https://www.yorku.ca/uit/cio/wp-content/uploads/sites/936/2025/07/Generative-AI-Guidelines_r2.1_July_2_2025.pdf",
    kind: "Guideline",
    format: "PDF"
  },
  {
    title: "Guidelines for Administrative Use of Generative Artificial Intelligence Chatbots & Assistants",
    publisher: "York University Office of the CIO",
    overview: "Covers the use of AI chatbots and assistants in administrative work, including tools that generate meeting notes or summaries",
    url: "https://www.yorku.ca/uit/cio/wp-content/uploads/sites/936/2026/02/Guidelines-AI-Chatbots-Assistants.pdf",
    kind: "Guideline",
    format: "PDF"
  }
];

const reports: DocumentRecord[] = [
  {
    title: "Fostering the Future of Artificial Intelligence",
    publisher: "York University Task Force on AI and Society",
    overview: "Surveys AI research, teaching and learning at York and recommends ways to expand interdisciplinary programs and research partnerships",
    url: "https://www.yorku.ca/research/wp-content/uploads/sites/39/2022/11/YorkVPRI-AI-and-Society-Task-Force-Report.final_.Nov_.10_.22.pdf",
    kind: "Report",
    format: "PDF"
  },
  {
    title: "Who Is Using Generative AI in Higher Education?",
    publisher: "The Conference Board of Canada",
    overview: "Examines how generative AI use and attitudes vary across student groups and educational settings",
    url: "https://fsc-ccf.ca/wp-content/uploads/2024/07/who-is-using-generative-ai-in-higher-education_2024.pdf",
    kind: "Report",
    format: "PDF"
  }
];

function OfficialLink({ record }: { record: DocumentRecord }) {
  return <a className="text-link" href={record.url} target="_blank" rel="noreferrer">
    Official {record.format === "PDF" ? "PDF" : "document"}
    <span className="visually-hidden"> for {record.title}, opens in a new tab</span>
  </a>;
}

function ReportList({ records, open }: { records: DocumentRecord[]; open: (record: DocumentRecord) => void }) {
  return <div className="publication-list">
    {records.map((record) => (
      <article className="publication-row" key={record.url}>
        <p className="document-meta"><span>{record.kind}</span> {record.publisher}</p>
        <div><h3>{record.title}</h3><p className="document-overview">{record.overview}</p></div>
        <div className="document-actions">
          <button type="button" aria-haspopup="dialog" onClick={() => open(record)}>
            Read {record.kind.toLowerCase()}<span className="visually-hidden"> {record.title}</span>
          </button>
          <OfficialLink record={record} />
        </div>
      </article>
    ))}
  </div>;
}

function DocumentReader({ record, close }: { record: DocumentRecord; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return <dialog ref={dialog} className="document-reader" aria-labelledby="document-reader-title" onClose={close}>
    <header className="document-reader-header">
      <div>
        <p className="document-meta">{record.publisher}</p>
        <h2 id="document-reader-title">{record.title}</h2>
        <OfficialLink record={record} />
      </div>
      <button autoFocus type="button" onClick={() => dialog.current?.close()}>Close</button>
    </header>
    <iframe src={record.section ? `${record.url}#${record.section}` : record.url} title={`Full document for ${record.title}`} />
  </dialog>;
}

export function GovernancePage({ content, section }: { content: ContentBundle; section?: string }) {
  const [openDocument, setOpenDocument] = useState<DocumentRecord | null>(null);
  const [openGroup, setOpenGroup] = useState<Group | null>(null);
  const featuredUrls = new Set(policies.map(({ url }) => url));
  const related = content.policy.filter(({ data }) => data.url && !featuredUrls.has(data.url));

  useEffect(() => {
    if (section) {
      const target = document.getElementById(`governance-${section}`);
      if (target) {
        if (target instanceof HTMLDetailsElement) target.open = true;
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView();
      }
    }
  }, [section]);

  const roundtable = groupById("ai-roundtable")!;
  const records = groupRecords[roundtable.id];

  return <div className="policies-reports governance-landing">
    <header className="governance-intro">
      <div className="shell">
        <p className="eyebrow">AI @ York</p>
        <h1>Policy, governance<br className="governance-title-break" /> and community</h1>
        <p className="lead">Explore the policy, the people shaping AI at York and the communities bringing it to life.</p>
        <nav className="governance-nav" aria-label="Governance sections">
          {[["roundtables", "Roundtable"], ["policy", "Policy"], ["working-groups", "Working groups"], ["community", "Communities"], ["reports", "Reports"]].map(([id, label]) =>
            <a key={id} href={`#/governance?section=${id}`}>{label}</a>)}
        </nav>
      </div>
    </header>
    <section id="governance-roundtables" className="governance-band roundtable-band" aria-labelledby="roundtables-heading">
      <div className="shell governance-split">
        <div>
          <h2 id="roundtables-heading">{roundtable.name}</h2>
          <p className="lead">{roundtable.overview}</p>
          <ul className="roundtable-mandate">{roundtable.mandate.map((item) => <li key={item}>{item}</li>)}</ul>
          <div className="roundtable-actions">
            <a className="button primary" href={`#/governance/groups/${roundtable.id}`}>Explore the Roundtable</a>
            <button className="text-button" type="button" aria-haspopup="dialog" onClick={() => setOpenGroup(roundtable)}>View overview<span className="visually-hidden"> of AI Roundtable</span></button>
          </div>
        </div>
        <div className="roundtable-records">
          {([{ key: "upcoming", label: "Next meeting", record: records.upcoming }, { key: "archive", label: "Recent activity", record: records.previous }] as const).map(({ key, label, record }) => <article key={key}>
            <p className="eyebrow">{label}</p>
            <time dateTime={record.date}>{formatDate(record.date)}</time>
            <h3><a href={groupRecordHref(roundtable.id, key)}>{record.title}</a></h3>
          </article>)}
        </div>
      </div>
    </section>
    <section id="governance-policy" className="governance-band policy-band" aria-labelledby="policy-heading">
      <div className="shell">
        <div className="governance-policy-heading"><h2 id="policy-heading">Policy</h2><p>Explore the policy and its related interpretations.</p></div>
        <iframe className="public-policy-frame" src={`${import.meta.env.BASE_URL}policy-studio.html?view=public&compact=1`} title="AI policy document" />
        <div className="policy-preview-actions">
          <a className="text-link" href={`${import.meta.env.BASE_URL}policy-studio.html?view=public`} target="_blank" rel="noreferrer">Open full policy<span className="visually-hidden"> (opens in a new tab)</span></a>
          <a className="text-link" href="#/governance?section=policy-sources">Official policy sources</a>
        </div>
        <details id="governance-policy-sources" className="document-related">
          <summary>Related official policy documents</summary>
          <ul>
            {policies.map(({ url, title }) => <li key={url}><a className="text-link" href={url}>{title}</a></li>)}
            {related.map(({ id, title, data }) => (
              <li key={id}>
                <a className="text-link" href={data.url}>{data.title || title}</a>
                {data.summary && <p>{data.summary.replace(/\.$/, "")}</p>}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
    <section id="governance-working-groups" className="governance-band" aria-labelledby="working-groups-heading">
      <div className="shell">
        <h2 id="working-groups-heading">Working groups</h2>
        <p className="lead">Follow the groups that bring research, teaching and service priorities to the AI Roundtable.</p>
        <GroupCards section="working-groups" open={setOpenGroup} />
      </div>
    </section>
    <section id="governance-community" className="community-band" aria-labelledby="community-heading">
      <header className="immersive-hero community-hero">
        <img src={communityImage} alt="" loading="lazy" />
        <div className="shell immersive-copy">
          <h2 id="community-heading">Communities</h2>
          <p className="lead">Connect with colleagues, share practical examples and take part in a session.</p>
        </div>
      </header>
      <div className="shell governance-band">
        <GroupCards section="community" open={setOpenGroup} />
        {content.community.length > 0 && <section className="community-listings"><h3>More communities</h3><div className="governance-directory">{content.community.map((item) => <article className="governance-directory-row" key={item.id}>
          <div><h4>{item.data.name}</h4><p>{item.data.summary}</p>{item.data.contact && <p>Contact: {item.data.contact}</p>}</div>
          {item.data.url && <a className="text-link" href={item.data.url}>Join or learn more</a>}
        </article>)}</div></section>}
      </div>
    </section>
    <section id="governance-reports" className="governance-band reports-band" aria-labelledby="reports-heading">
      <div className="shell">
        <h2 id="reports-heading">Reports and deliverables</h2>
        <ReportList records={reports} open={setOpenDocument} />
        <div className="report-records">
          <h3>Roundtable and working group deliverables</h3>
          <ul>{["ai-roundtable", "student-administrative-services", "teaching-learning", "research"].map((id) => {
            const { title, description, status } = groupRecords[id].deliverable;
            return <li key={id}><a className="text-link" href={groupRecordHref(id, "deliverable")}>{title}</a><span className="status">{status}</span><p>{description}</p></li>;
          })}</ul>
        </div>
      </div>
    </section>
    {openDocument && <DocumentReader record={openDocument} close={() => setOpenDocument(null)} />}
    {openGroup && <GroupOverview group={openGroup} close={() => setOpenGroup(null)} />}
  </div>;
}
