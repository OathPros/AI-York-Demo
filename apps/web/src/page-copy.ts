import type { EditablePage, PageCopy } from "@ai-york/contracts";

export const pageCopy: Record<EditablePage, PageCopy> = {
  home: { title: "AI @ York", intro: "York University supports the responsible use of artificial intelligence in work, study, teaching and research. Find clear guidance on what you can do, which tools to use and how to get started" },
  study: { title: "Learning with AI", intro: "Find out what your course allows, practise with York-supported tools and learn how to acknowledge AI assistance in your work" },
  teach: { title: "Teaching with AI", intro: "Set expectations for AI in your course, design assessments around learning goals and help students evaluate AI outputs" },
  research: { title: "Research with AI", intro: "Check consent, data restrictions and research integrity requirements before using AI in your project" },
  work: { title: "AI at Work", intro: "Use York-supported AI for administrative tasks and check what information your tool can handle before you share it" },
  partner: { title: "Partner or Study", intro: "Explore York degrees and certificates in AI and find routes to research collaboration" }
};

export type PublishedPages = Partial<Record<EditablePage, PageCopy>>;
