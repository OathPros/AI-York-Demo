import React, { useEffect, useRef, useState } from "react";
import type { ContentBundle } from "@ai-york/contracts";
import { GroupCards, GroupOverview, type Group } from "./governance-groups";
import "./policies-reports.css";
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

function DocumentCards({ records, open }: { records: DocumentRecord[]; open: (record: DocumentRecord) => void }) {
  return <div className="document-cards">
    {records.map((record) => (
      <article className="document-card" key={record.url}>
        <p className="document-meta"><span>{record.kind}</span> {record.publisher}</p>
        <h3>{record.title}</h3>
        <p className="document-overview">{record.overview}</p>
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
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        target.scrollIntoView();
      }
    }
  }, [section]);

  return <div className="section policies-reports governance-landing">
    <header className="documents-intro">
      <h1>Policy, governance and community</h1>
      <p className="lead">Explore the policy, the people shaping AI at York and the communities bringing it to life.</p>
      <nav className="filters catalog-filters" aria-label="Governance sections">
        {[["roundtables", "Roundtable"], ["policy", "Policy"], ["working-groups", "Working groups"], ["community", "Communities"], ["reports", "Reports"]].map(([id, label]) =>
          <a key={id} href={`#/governance?section=${id}`}>{label}</a>)}
      </nav>
    </header>
    <div className="governance-top">
      <section id="governance-roundtables" aria-labelledby="roundtables-heading">
        <h2 id="roundtables-heading">Roundtable</h2>
        <GroupCards section="roundtables" open={setOpenGroup} />
      </section>
      <section id="governance-policy" aria-labelledby="policy-heading">
        <h2 id="policy-heading">Policy</h2>
        <p className="policy-preview-notice">Explore the policy and its related interpretations.</p>
        <iframe className="public-policy-frame" src={`${import.meta.env.BASE_URL}policy-studio.html?view=public&compact=1`} title="AI policy document" />
        <div className="policy-preview-actions">
          <a className="text-link" href={`${import.meta.env.BASE_URL}policy-studio.html?view=public`} target="_blank" rel="noreferrer">Open full policy<span className="visually-hidden"> (opens in a new tab)</span></a>
          <a className="text-link" href="#/governance?section=policy-sources">Official policy sources</a>
        </div>
      </section>
    </div>
    <section id="governance-working-groups" className="document-section" aria-labelledby="working-groups-heading">
      <h2 id="working-groups-heading">Working groups</h2>
      <GroupCards section="working-groups" open={setOpenGroup} />
    </section>
    <section id="governance-community" className="document-section" aria-labelledby="community-heading">
      <h2 id="community-heading">Communities</h2>
      <GroupCards section="community" open={setOpenGroup} />
      {content.community.length > 0 && <><h3>Additional community listings from Studio</h3><div className="grid">{content.community.map((item) => <article className="card" key={item.id}>
        <h3>{item.data.name}</h3><p>{item.data.summary}</p>{item.data.contact && <p>Contact: {item.data.contact}</p>}
        {item.data.url && <a className="text-link" href={item.data.url}>Join or learn more</a>}
      </article>)}</div></>}
    </section>
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
    <section id="governance-reports" className="document-section" aria-labelledby="reports-heading">
      <h2 id="reports-heading">Reports</h2>
      <DocumentCards records={reports} open={setOpenDocument} />
      <div className="report-records">
        <h3>Working group deliverables</h3>
        <ul>{["ai-roundtable", "student-administrative-services", "teaching-learning", "research"].map((id) => {
          const { title, description, status } = groupRecords[id].deliverable;
          return <li key={id}><a className="text-link" href={groupRecordHref(id, "deliverable")}>{title}</a><span className="status">{status}</span><p>{description}</p></li>;
        })}</ul>
      </div>
    </section>
    {openDocument && <DocumentReader record={openDocument} close={() => setOpenDocument(null)} />}
    {openGroup && <GroupOverview group={openGroup} close={() => setOpenGroup(null)} />}
  </div>;
}
