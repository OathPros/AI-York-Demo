export const backbone = [
  ["Inventory of Need", "Questions York needs to answer"],
  ["Content Inventory", "What exists and who owns it"],
  ["Disposition", "Keep · Migrate · Merge · Link · Retire"],
  ["Guidance Records", "Answer · source · owner · review"],
  ["Delivery", "Pages · filters · search"],
  ["Maintenance", "Monitoring · tickets · Studio"]
];

export const workstreams = [
  {
    name: "Band-Aid",
    objective: "Make the current site useful now",
    tasks: [
      "Fix broken links",
      "Turn existing guidance into scannable cards",
      "Add Tools & Access",
      "Add Governance: Roundtable, Working Groups, Communities of Practice, Reports, Policy and Interpretation"
    ],
    deliverables: ["Improved current AI @ York site"]
  },
  {
    name: "Inventory & Architecture",
    objective: "Define the service from user need",
    tasks: [
      "Catalogue priority questions across Study, Teach, Research and Work",
      "Inventory current pages, guidance, tools, owners and policy sources",
      "Map content against needs: Covered, Gap, Duplicate or Conflict",
      "Assign Keep, Migrate, Merge, Link or Retire",
      "Define the structured guidance content model",
      "Confirm source owner, content owner, approver and publisher roles",
      "Baseline priority tasks and success measures",
      "Finalize GUIDANCE filters, Policy and shared resource architecture"
    ],
    deliverables: ["Inventory of Need", "Content/disposition register", "Content model", "Authority model", "Approved architecture"]
  },
  {
    name: "Migrate & Redirect",
    objective: "Consolidate shared guidance in AI @ York",
    tasks: [
      "Confirm migrations with existing content owners",
      "Move agreed shared guidance from source sites",
      "Merge duplicate answers and retain source links",
      "Tag guidance for Study, Teach, Research and Work",
      "Redirect replaced URLs",
      "Validate links, redirects, metadata and indexing",
      "Test priority journeys on mobile, keyboard and assistive technology"
    ],
    deliverables: ["Migrated guidance", "Redirect map", "Tested GUIDANCE experience"]
  },
  {
    name: "Fill Gaps",
    objective: "Answer what existing York content does not",
    tasks: [
      "Prioritize missing questions from the inventory",
      "Draft direct answers linked to applicable policy/source material",
      "Resolve conflicting advice with responsible owners",
      "Record owner, approver, status and review date",
      "Define escalation for disputed, stale, ownerless or overdue guidance"
    ],
    deliverables: ["Approved guidance inventory covering priority needs"]
  },
  {
    name: "Centralize",
    objective: "Turn approved guidance into reusable structured content",
    tasks: [
      "Store approved answers using the common content model",
      "Make the same records drive GUIDANCE and site search",
      "Expose source, scope, owner and current status with each answer",
      "Test source-linked search/assistant responses against approved records"
    ],
    deliverables: ["One searchable source of approved AI guidance"]
  },
  {
    name: "Automate Maintenance",
    objective: "Find relevant updates before people have to report them",
    tasks: [
      "Define York sources to monitor for AI events, training and learning posts",
      "Run an AI workflow that detects new or changed items",
      "Check relevance and duplication",
      "Create a review ticket containing source, proposed change and destination",
      "Require human approval before publication"
    ],
    deliverables: ["AI monitoring workflow + human review queue"]
  },
  {
    name: "Studio",
    objective: "Connect policy changes directly to guidance maintenance",
    tasks: [
      "Model stable, versioned policy provisions",
      "Assign section-level editing rights",
      "Link interpretations to policy provisions",
      "Flag linked guidance when a source changes",
      "Route unsupported interpretations to policy owners as gaps",
      "Maintain approval history and audit trail",
      "Publish approved interpretations to GUIDANCE and search"
    ],
    deliverables: ["AI @ York Studio: controlled policy and interpretation workflow"]
  }
];

export const contentModel = [
  ["Need / question", "The user problem the content answers", "Can I use student information in an AI tool?"],
  ["Activity", "GUIDANCE filters", "Teach · Work"],
  ["Topic", "Grouping and search", "Data / Privacy"],
  ["Answer", "The maintained practical guidance", "Approved answer"],
  ["Policy / source", "Why the answer is authoritative", "Linked provision(s)"],
  ["Disposition", "What happens to current content", "Merge"],
  ["Content owner", "Who maintains the answer", "Named functional unit"],
  ["Approver", "Who can approve the answer", "Responsible authority"],
  ["Status", "What is allowed to publish", "Approved"],
  ["Review date", "When the answer must be checked", "Defined date"],
  ["Old URL(s)", "Migration and redirects", "Legacy source pages"]
];

export const operatingModel = [
  {
    title: "Content ownership",
    entries: [
      ["Source owner", "Owns the authoritative material"],
      ["Content owner", "Keeps the practical answer current"],
      ["Approver", "Validates content within the appropriate authority"],
      ["Publisher", "Releases approved content and manages site quality"]
    ]
  },
  {
    title: "When something changes",
    entries: [
      ["Wrong", "Correct or withdraw it"],
      ["Disputed", "Escalate to the responsible authority"],
      ["Stale", "Flag for review"],
      ["Ownerless", "Assign accountability"],
      ["Policy changes", "Identify every linked interpretation that needs review"]
    ]
  }
];

export const dependencies = [
  ["Inventory before migration", "Know the need before deciding what content belongs"],
  ["Content model before centralization", "Structure records before building search around them"],
  ["Manual workflow before automation", "Prove review before asking AI to trigger it"],
  ["Governance before Studio", "Studio automates an agreed operating model"]
];

export const outcomes = [
  ["Findability", "Users answer priority questions without comparing multiple York sites"],
  ["Authority", "Every maintained answer has a source, owner, approver, status and review date"],
  ["Consolidation", "Duplicates are merged or retired and old URLs reach the maintained answer"],
  ["Maintenance", "Stale or changed content creates visible review work"],
  ["Reuse", "Pages, search and future AI experiences use the same approved records"],
  ["Control", "Automation proposes work; people approve publication"]
];
