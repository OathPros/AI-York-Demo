import React, { useEffect, useRef } from "react";

type GroupSection = "roundtables" | "working-groups" | "community";
export type Group = {
  id: string;
  section: GroupSection;
  type: string;
  name: string;
  overview: string;
  mandate: string[];
  note?: string;
  confirmedMembers?: string[];
  exampleMembers: string[];
  source?: string;
  joinUrl?: string;
};

const groups: Group[] = [
  {
    id: "ai-roundtable", section: "roundtables", type: "Roundtable", name: "AI Roundtable",
    overview: "York's cross-university AI policy-setting body and the forum where its current AI guidelines originated.",
    mandate: [
      "Bring perspectives from teaching and learning, research, and university operations together to shape York's approach to AI.",
      "Set policy direction and coordinate responsible AI guidance, drawing on the priorities and advice of its working groups."
    ],
    exampleMembers: ["Gandalf", "Galadriel", "Elrond", "Aragorn"],
    source: "https://www.yorku.ca/ai-at-york/"
  },
  {
    id: "student-administrative-services", section: "working-groups", type: "Working group", name: "Student and Administrative Services AI Working Group",
    overview: "A Roundtable working group identifying AI priorities for student-facing and administrative services.",
    mandate: [
      "Identify priorities, opportunities and risks for AI in student and administrative services, and bring recommendations to the AI Roundtable.",
      "Consider how responsible AI can support services while protecting information and keeping people accountable for decisions."
    ],
    note: "The working group sets near-term priorities; its future term and mandate are under discussion.",
    exampleMembers: ["Samwise Gamgee", "Éowyn", "Faramir", "Merry Brandybuck"]
  },
  {
    id: "teaching-learning", section: "working-groups", type: "Working group", name: "Teaching and Learning AI Working Group",
    overview: "A Roundtable working group identifying AI priorities for teaching, learning and the student experience.",
    mandate: [
      "Identify priorities and recommendations for AI in teaching and learning for the AI Roundtable.",
      "Consider learning, assessment, academic integrity and equitable access as AI practices evolve."
    ],
    note: "The working group sets near-term priorities; its future term and mandate are under discussion.",
    exampleMembers: ["Arwen", "Bilbo Baggins", "Pippin Took", "Treebeard"]
  },
  {
    id: "research", section: "working-groups", type: "Working group", name: "Research AI Working Group",
    overview: "A Roundtable working group identifying AI priorities and considerations for research.",
    mandate: [
      "Identify research-related AI priorities and recommendations for the AI Roundtable.",
      "Consider research methods, data stewardship, ethics and the supports research teams need to use AI responsibly."
    ],
    note: "The working group sets near-term priorities; its future term and mandate are under discussion.",
    exampleMembers: ["Gimli", "Legolas", "Frodo Baggins", "Radagast"]
  },
  {
    id: "data-analytics", section: "community", type: "Community of engagement", name: "Data and Analytics Community of Engagement",
    overview: "A community connecting data and analytics practitioners, with an expanding interest in AI and data management.",
    mandate: [
      "Connect people working with data and analytics to share knowledge and explore common challenges.",
      "Explore how AI intersects with data management, responsible practice and the university's data needs."
    ],
    confirmedMembers: ["Patrick Cernea, Chair (OIPA)"],
    exampleMembers: ["Gandalf", "Rosie Cotton", "Faramir"]
  },
  {
    id: "student-services-genai", section: "community", type: "Community of practice", name: "Student Services Generative AI Community of Practice",
    overview: "A community for people in student-facing services to share challenges, develop resources and put responsible AI ideas into practice.",
    mandate: [
      "Connect colleagues across student-facing services to identify opportunities, share lessons and build institutional capacity for generative AI.",
      "Develop and share practical tools, resources and approaches that support responsible, student-focused AI solutions."
    ],
    confirmedMembers: ["Nick Valentino, Co-Chair", "Luke Gagliardi, Co-Chair"],
    exampleMembers: ["Samwise Gamgee", "Arwen", "Pippin Took"],
    source: "https://www.yorku.ca/uit/pmo/cop-gen-ai/",
    joinUrl: "https://www.yorku.ca/uit/pmo/cop-gen-ai/"
  },
  {
    id: "administrative-ai", section: "community", type: "Community of practice", name: "AI Community of Practice for Administrative Employees",
    overview: "A space for administrative employees to share practical experience and learn about responsible AI at work.",
    mandate: [
      "Bring administrative employees together to exchange examples, questions and lessons about AI in their work.",
      "Support shared learning about appropriate tools, information handling and human oversight."
    ],
    exampleMembers: ["Éowyn", "Bilbo Baggins", "Gimli"]
  }
];

export function groupById(id: string): Group | undefined {
  return groups.find((group) => group.id === id);
}

export function GroupCards({ section, open }: { section: GroupSection; open: (group: Group) => void }) {
  return <div className="document-cards">
    {groups.filter((group) => group.section === section).map((group) => <article className="document-card group-card" key={group.id}>
      <p className="document-meta"><span>{group.type}</span></p>
      <h3>{group.name}</h3>
      <p className="document-overview">{group.overview}</p>
      <div className="document-actions"><button type="button" aria-haspopup="dialog" onClick={() => open(group)}>View overview<span className="visually-hidden"> of {group.name}</span></button></div>
    </article>)}
  </div>;
}

export function GroupOverview({ group, close }: { group: Group; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="group-dialog" aria-labelledby="group-overview-title" onClose={close}>
    <header>
      <div><p className="document-meta">{group.type}</p><h2 id="group-overview-title">{group.name}</h2></div>
      <button type="button" autoFocus onClick={() => dialog.current?.close()}>Close</button>
    </header>
    <div className="group-dialog__body">
      <h3>Overview</h3><p>{group.overview}</p>
      {group.note && <p className="notice">{group.note}</p>}
      <a className="button primary" href={`#/governance/groups/${group.id}`}>See more<span className="visually-hidden"> about {group.name}</span></a>
    </div>
  </dialog>;
}

export function GroupPage({ id, onRequestJoin }: { id: string; onRequestJoin: (name: string) => void }) {
  const group = groupById(id);
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!group) return <div className="section policies-reports"><h1>Group not found</h1><p>We couldn't find this group.</p><a className="text-link" href="#/governance">Back to policy and community</a></div>;
  return <div className="section policies-reports group-page">
    <a className="text-link group-back" href={`#/governance?section=${group.section}`}>← Back to policy and community</a>
    <header className="group-page__header"><p className="eyebrow">{group.type}</p><h1>{group.name}</h1><p className="lead">{group.overview}</p></header>
    {group.note && <p className="notice">{group.note}</p>}
    <section aria-labelledby="group-mandate"><h2 id="group-mandate">Mandate</h2>{group.mandate.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>
    <section aria-labelledby="group-members"><h2 id="group-members">Members</h2>
      <ul className="group-members">{[...(group.confirmedMembers ?? []), ...group.exampleMembers].map((member) => <li key={member}><span aria-hidden="true">{member.charAt(0)}</span>{member}</li>)}</ul>
    </section>
    {group.section !== "roundtables" && <section aria-labelledby="group-join"><h2 id="group-join">Join</h2>
      {group.joinUrl ? <><p>Visit the official community page to find the membership form.</p><a className="button primary" href={group.joinUrl} target="_blank" rel="noreferrer">Join this community <span className="visually-hidden">(opens the official page in a new tab)</span></a></>
        : <><p>Connect with colleagues and contribute to the conversation.</p><button className="primary" type="button" onClick={() => onRequestJoin(group.name)}>Request to join</button></>}
    </section>}
    {group.source && <p><a className="text-link" href={group.source} target="_blank" rel="noreferrer">Visit the official {group.name} source<span className="visually-hidden"> (opens in a new tab)</span></a></p>}
  </div>;
}
