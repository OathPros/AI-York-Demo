import React, { useEffect, useRef, useState } from "react";
import type { ContentItem } from "@ai-york/contracts";
import "./policies-reports.css";

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

export function PoliciesReportsPage({ sources }: { sources: ContentItem[] }) {
  const [openDocument, setOpenDocument] = useState<DocumentRecord | null>(null);
  const featuredUrls = new Set(policies.map(({ url }) => url));
  const related = sources.filter(({ data }) => data.url && !featuredUrls.has(data.url));

  return <div className="section policies-reports">
    <header className="documents-intro">
      <h1>Policies and reports</h1>
      <p className="lead">Read York policies and guidelines that apply to AI use and explore research on AI in higher education</p>
    </header>
    <section className="document-section" aria-labelledby="policies-heading">
      <h2 id="policies-heading">Policies and guidelines</h2>
      <DocumentCards records={policies} open={setOpenDocument} />
      {related.length > 0 && <details className="document-related">
        <summary>Related guidance and policy sources</summary>
        <ul>
          {related.map(({ id, title, data }) => (
            <li key={id}>
              <a className="text-link" href={data.url}>{data.title || title}</a>
              {data.summary && <p>{data.summary.replace(/\.$/, "")}</p>}
            </li>
          ))}
        </ul>
      </details>}
    </section>
    <section className="document-section" aria-labelledby="reports-heading">
      <h2 id="reports-heading">Reports</h2>
      <DocumentCards records={reports} open={setOpenDocument} />
    </section>
    {openDocument && <DocumentReader record={openDocument} close={() => setOpenDocument(null)} />}
  </div>;
}
