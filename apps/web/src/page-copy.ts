import type { EditablePage, PageCopy } from "@ai-york/contracts";

export const pageCopy: Record<EditablePage, PageCopy> = {
  home: { title: "AI @ York", intro: "York University supports the responsible use of artificial intelligence in work, study, teaching and research. Find clear guidance on what you can do, which tools to use and how to get started" },
  study: { title: "Study with AI", intro: "Know what your course allows, use AI to practise independently and plan its use in graduate work" },
  teach: { title: "Teach with AI", intro: "Set clear expectations for assessments, build critical AI literacy and guide graduate students in your discipline" },
  research: { title: "Research with AI", intro: "Plan an AI workflow that meets ethics and funding requirements and lets others understand how you did the work" },
  work: { title: "AI at work", intro: "Choose an appropriate tool for your administrative task, check what information it can handle and get oversight when needed" },
  partner: { title: "Partner or Study", intro: "Explore York degrees and certificates in AI and find routes to research collaboration" }
};

export type PublishedPages = Partial<Record<EditablePage, PageCopy>>;
