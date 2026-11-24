import type { Activity, ContentItem } from "@ai-york/contracts";

type RecordSet = {
  group: string;
  activities: Activity[];
  owner: string;
  venue: string;
  previous: { date: string; title: string; discussion: string; decision: string };
  upcoming: { date: string; title: string; agenda: string[] };
  deliverable: { title: string; description: string; due: string; status: "In progress" | "Planned" };
  resource: { title: string; href: string };
};

export const groupRecords: Record<string, RecordSet> = {
  "ai-roundtable": {
    group: "AI Roundtable", activities: ["teach", "research", "work"], owner: "Roundtable secretariat", venue: "Online",
    previous: { date: "2026-11-18", title: "Briefing priorities for winter", discussion: "Working-group representatives compared recurring questions about course expectations, research records and internal service drafts.", decision: "Use one common briefing format and keep the three workstreams distinct in the winter agenda." },
    upcoming: { date: "2027-01-21", title: "Winter AI Roundtable", agenda: ["Review the three working-group briefings", "Identify questions to bring to the communities of practice", "Agree on the next briefing schedule"] },
    deliverable: { title: "Winter cross-campus briefing", description: "Collect the working groups’ examples and open questions in a single discussion packet.", due: "2027-01-15", status: "In progress" },
    resource: { title: "Explore the working groups", href: "#/governance?section=working-groups" }
  },
  "student-administrative-services": {
    group: "Student and Administrative Services AI Working Group", activities: ["work"], owner: "Service design lead", venue: "Keele campus",
    previous: { date: "2026-11-17", title: "Service desk drafting review", discussion: "The group compared fictional service replies and found that several drafts omitted a route to speak with a person.", decision: "Include a human escalation route in the next set of sample replies." },
    upcoming: { date: "2026-12-10", title: "Service reply review lab", agenda: ["Compare two sample service replies", "Review the route for escalating a complex request", "Select examples for the Roundtable briefing"] },
    deliverable: { title: "Service reply example set", description: "Prepare a fictional request and two draft replies with an explanation of each editorial choice.", due: "2026-12-08", status: "In progress" },
    resource: { title: "Visit the Student Services community", href: "#/governance/groups/student-services-genai" }
  },
  "teaching-learning": {
    group: "Teaching and Learning AI Working Group", activities: ["study", "teach"], owner: "Learning design lead", venue: "Keele campus",
    previous: { date: "2026-11-16", title: "Assessment examples review", discussion: "Participants compared sample assignments and identified places where students could have trouble distinguishing practice from assessed work.", decision: "Test the sample assignments with a peer reader before sharing them at the next workshop." },
    upcoming: { date: "2026-12-03", title: "Assessment design exchange", agenda: ["Walk through two fictional assignment briefs", "Compare feedback from peer readers", "Identify examples for the winter briefing"] },
    deliverable: { title: "Annotated assignment examples", description: "Label where each assignment explains its expectations and collect peer feedback on clarity.", due: "2026-12-01", status: "In progress" },
    resource: { title: "Explore teaching guidance", href: "#/guidance?activity=teach" }
  },
  research: {
    group: "Research AI Working Group", activities: ["research"], owner: "Research methods lead", venue: "Online",
    previous: { date: "2026-11-19", title: "Methods documentation review", discussion: "The group compared two fictional literature-screening workflows and found that the reviewers could reproduce only one exclusion decision.", decision: "Carry an example of an auditable exclusion log into the next review." },
    upcoming: { date: "2026-12-15", title: "Research methods roundtable", agenda: ["Walk through the example exclusion log", "Compare how reviewers documented disagreements", "Identify open questions for the winter briefing"] },
    deliverable: { title: "Literature screening example log", description: "Build a sample log from public abstracts and record why reviewers included or excluded each entry.", due: "2026-12-11", status: "In progress" },
    resource: { title: "Explore research guidance", href: "#/guidance?activity=research" }
  },
  "data-analytics": {
    group: "Data and Analytics Community of Engagement", activities: ["research", "work"], owner: "Session facilitator", venue: "Online",
    previous: { date: "2026-11-12", title: "Public data walkthrough", discussion: "Members found that two charts presented the same metric with different denominators. The group compared which labels made the difference easiest to spot.", decision: "Use the same published dataset at the next session so participants can compare their methods." },
    upcoming: { date: "2026-12-08", title: "Sense checking AI charts", agenda: ["Review a chart against its public dataset", "Compare notes on missing observations", "Share one reproducible validation step"] },
    deliverable: { title: "Chart review worksheet", description: "Collect the denominator, label and missing-data checks from the walkthrough.", due: "2026-12-07", status: "In progress" },
    resource: { title: "Compare research and work guidance", href: "#/guidance?activities=research,work" }
  },
  "student-services-genai": {
    group: "Student Services Generative AI Community of Practice", activities: ["work"], owner: "Practice exchange facilitator", venue: "Online",
    previous: { date: "2026-11-10", title: "Plain language practice exchange", discussion: "Pairs rewrote a fictional student services reply and checked whether the revised message still explained the next step.", decision: "Bring a before-and-after pair to the next exchange for a group critique." },
    upcoming: { date: "2026-12-09", title: "Student services writing exchange", agenda: ["Compare draft replies to a fictional enquiry", "Identify missing next steps", "Share one plain language revision"] },
    deliverable: { title: "Before and after writing samples", description: "Pair representative inbox replies with annotations on clarity, accessibility and human follow-up.", due: "2026-12-07", status: "In progress" },
    resource: { title: "See the service design working group", href: "#/governance/groups/student-administrative-services" }
  },
  "administrative-ai": {
    group: "AI Community of Practice for Administrative Employees", activities: ["work"], owner: "Practice exchange facilitator", venue: "Online",
    previous: { date: "2026-11-13", title: "Meeting follow up practice exchange", discussion: "Members compared a fictional meeting transcript with a short list of actions and noticed that one suggestion had been reported as a decision.", decision: "Use the next session to compare how reviewers distinguish proposals, decisions and actions." },
    upcoming: { date: "2026-12-17", title: "Meeting notes practice lab", agenda: ["Compare two summaries of fictional notes", "Mark tentative proposals and assigned actions", "Discuss how to review a summary before sharing it"] },
    deliverable: { title: "Meeting notes review exercise", description: "Create a synthetic notes sample with a separate answer sheet for decisions and follow-up actions.", due: "2026-12-14", status: "Planned" },
    resource: { title: "Review workplace tool access and guidance", href: "#/guidance?activity=work" }
  }
};

export const groupRecordHref = (id: string, record: "upcoming" | "archive" | "deliverable") => `#/governance/groups/${id}?record=${record}`;

const demoEvents: ContentItem[] = Object.entries(groupRecords).map(([id, record]) => ({
  id: `demo-session-${id}`,
  title: record.upcoming.title,
  status: "published",
  origin: "base",
  collection: "event",
  data: {
    date: record.upcoming.date, startTime: "12:00", timezone: "America/Toronto", organizer: record.group,
    location: record.venue, audience: "York community", summary: record.upcoming.agenda[0],
    sourceUrl: groupRecordHref(id, "upcoming"), activities: record.activities,
    type: ["data-analytics", "teaching-learning", "administrative-ai"].includes(id) ? "training" : "event"
  }
}));

export function publicEvents(events: ContentItem[]): ContentItem[] {
  const ids = new Set(events.map((event) => event.id));
  return [...events, ...demoEvents.filter((event) => !ids.has(event.id))].sort((a, b) => a.data.date.localeCompare(b.data.date));
}

export const exampleStories = [
  { id: "assessment-exchange", date: "2026-11-20", title: "A clearer assignment brief starts with a peer reader", activities: ["study", "teach"],
    summary: "An assessment design exchange will compare sample assignments and look for places where students need clearer instructions.",
    paragraphs: ["In an example review, two readers interpreted the same instruction differently. One treated an AI brainstorming exercise as optional practice; the other assumed the resulting notes had to be submitted.", "The next exchange uses that mismatch to test the order and wording of the sample prompts. Participants will compare their readings before discussing what they would revise."],
    related: [{ title: "Assessment design exchange", href: groupRecordHref("teaching-learning", "upcoming") }] },
  { id: "screening-log", date: "2026-11-19", title: "A research team tests its literature screening record", activities: ["research"],
    summary: "A sample screening log shows which notes help a second reviewer reconstruct an exclusion decision.",
    paragraphs: ["Two reviewers worked from the same set of public abstracts. In the first example, the log said only that an abstract was outside scope. In the second, it recorded the specific review criterion and the evidence in the abstract.", "The research methods session will use the two entries to discuss how to document disagreements and keep decisions traceable."],
    related: [{ title: "Research methods record", href: groupRecordHref("research", "archive") }] },
  { id: "meeting-note-review", date: "2026-11-18", title: "What a meeting summary can lose", activities: ["work"],
    summary: "An administrative practice lab uses fictional notes to examine the difference between a suggestion, a decision and an action.",
    paragraphs: ["The sample notes include a proposal to change a service timetable. One draft summary presents the proposal as a completed decision even though the group agreed only to gather more information.", "Participants will mark the original passage, revise the summary and compare the signals they used to identify what the group actually agreed."],
    related: [{ title: "Meeting notes practice lab", href: groupRecordHref("administrative-ai", "upcoming") }] },
  { id: "winter-roundtable", date: "2026-11-18", title: "Three working groups prepare a winter briefing", activities: ["teach", "research", "work"],
    summary: "The sample Roundtable agenda brings together open questions on assessment, research documentation and service replies.",
    paragraphs: ["Each workstream will bring a representative task, the question it raises and a record of what the group discussed. The briefing uses a common format so readers can follow each item back to its source.", "The agenda includes time to identify questions that communities of practice could explore in a future session."],
    related: [{ title: "Winter briefing deliverable", href: groupRecordHref("ai-roundtable", "deliverable") }] }
] satisfies { id: string; date: string; title: string; activities: Activity[]; summary: string; paragraphs: string[]; related: { title: string; href: string }[] }[];
