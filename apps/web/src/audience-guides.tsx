import React, { useRef } from "react";
import type { PageCopy } from "@ai-york/contracts";
import { pageCopy } from "./page-copy";
import studyImage from "./assets/banners/study.webp";
import teachImage from "./assets/banners/teach.webp";
import researchImage from "./assets/banners/research.webp";
import workImage from "./assets/banners/work.webp";
import "./audience-guides.css";

type Guide = "study" | "teach" | "research" | "work";
type Link = [label: string, href: string];
type Topic = { id: string; title: string; items: [heading: string, copy: string][]; links?: Link[]; example?: [heading: string, copy: string] };

const guides: Record<Guide, { audience: string; image: string; topics: Topic[] }> = {
  study: {
    audience: "Undergraduate and graduate students",
    image: studyImage,
    topics: [
      { id: "coursework", title: "Course rules and citation", items: [
        ["Check this assignment", "York’s Academic Conduct Policy treats undocumented or unreferenced use of AI in assessed work as a breach. Documented use is generally permitted unless your instructor restricts it for the course or assessment. Read the course outline and assignment instructions, and ask about unclear uses before you begin"],
        ["Keep a record as you work", "Follow the instructor’s directions for acknowledgement and citation. Keep the tool name, how you used it and what you changed. Save prompts or outputs if required. Open and read the original sources before citing them"]
      ], links: [
        ["Read the Academic Conduct Policy", "https://www.yorku.ca/secretariat/policies/policies/academic-conduct-policy-and-procedures/"],
        ["Get citation help from York Libraries", "https://www.library.yorku.ca/web/research-learn/artificial-intelligence-citing-academic-integrity/"]
      ] },
      { id: "practice", title: "Study and practise", items: [
        ["Build independence", "Ask for hints, practice questions or a second explanation using material you can share. Try each task yourself and compare the feedback with your course notes. If an answer seems convincing but misses context or reinforces a stereotype, investigate what it left out"],
        ["Make university easier to navigate", "Use text to speech or a plain language explanation to access material you have permission to share. Ask for an example of a respectful email to an instructor or a study schedule built around your own deadlines"],
        ["Find scholarly sources", "Use AI to suggest keywords and alternate terms. Search the library databases yourself and read any article before relying on it. Get permission before uploading course materials, classmates’ work or class recordings"]
      ], example: ["Try a practice prompt", "Give me three practice questions on this topic. Wait for my answer to each question, then give me a hint I can use to improve it"], links: [
        ["Find library workshops and guides", "https://www.library.yorku.ca/web/research-learn/artificial-intelligence-workshops-guides-more/"],
        ["Explore AI fundamentals", "#/learning"],
        ["Get Copilot with your student account", "https://www.yorku.ca/uit/student-services/ai/"],
        ["Explore LinkedIn Learning at York", "https://www.yorku.ca/services/lil/"]
      ] },
      { id: "graduate", title: "Theses and graduate milestones", items: [
        ["Agree on boundaries with your supervisor", "Before using AI to research, create, write or edit a thesis or dissertation, discuss the proposed use with your supervisor or supervisory committee. Clarify expectations for graduate coursework and comprehensive exams separately. Consult your graduate program director if the expectations remain unclear"],
        ["Prepare to explain your contribution", "Keep a record of where AI affected your methods, writing or revisions. Be ready to explain at your defence what you did, what the tool contributed and how the work represents your original contribution"]
      ], links: [
        ["Read the Ontario graduate research considerations", "https://cou.ca/wp-content/uploads/2024/10/OCGS-AI-graduate-research-considerations-FN-Oct-1-2024.pdf"],
        ["Plan an AI research workflow", "#/research"]
      ] }
    ]
  },
  teach: {
    audience: "Instructors and graduate supervisors",
    image: teachImage,
    topics: [
      { id: "assessment", title: "Course expectations and assessment", items: [
        ["Make the rules visible", "State where AI is prohibited, optional or expected for each assessment. Name permitted tasks such as brainstorming, translation or code debugging, and specify how students should document or cite use. Give students who opt out an equivalent way to demonstrate the same learning"],
        ["Design for evidence of learning", "Identify what students need to do independently. Use staged drafts, in-class explanations, simulations or a task grounded in a class discussion. When AI is part of the assessment, give explicit criteria for evaluating its output"],
        ["Handle suspected misuse", "York does not recommend AI detection tools. Their results can be inaccurate and can disproportionately flag multilingual writers. Keep student submissions out of external detectors and use York’s academic integrity support for suspected breaches"]
      ], example: ["Example assignment wording", "You may use AI to brainstorm research questions. Develop your argument from course readings and your own analysis. In a short note, identify the tool and explain how you used it to shape your question"], links: [
        ["Get academic integrity support for instructors", "https://www.yorku.ca/unit/vpacad/academic-integrity/ai-technology-and-academic-integrity/"],
        ["Use the AI Assessment Scale", "https://open-publishing.org/journals/index.php/jutlp/article/view/810/769"]
      ] },
      { id: "classroom", title: "AI literacy in class", items: [
        ["Make AI visible in familiar tools", "Show where features such as suggested rewrites or summaries use AI. Discuss where the feature fits disciplinary practice, which perspectives it misses and when students might choose to work without it"],
        ["Give everyone the same output to critique", "Bring one generated response into class. Ask groups to compare it with a course reading, trace an unsupported claim and explain a revision. The class can practise evaluating AI without each student needing an account"],
        ["Use AI for practice and feedback", "Try tailored scenarios, role-play or feedback on a fictional sample. Ask students to explain which suggestions they would accept and why"]
      ], links: [
        ["Download the editable York slide deck", "https://www.yorku.ca/teachingcommons/wp-content/uploads/sites/38/2024/11/GenAI-and-Academic-Integrity-slide-deck.pptx"],
        ["Explore King’s College London teaching guidance", "https://www.kcl.ac.uk/about/strategy/learning-and-teaching/ai-guidance"],
        ["Find Teaching Commons support", "https://www.yorku.ca/teachingcommons/artificial-intelligence-ai-pedagogies/"]
      ] },
      { id: "preparation", title: "Course preparation and feedback", items: [
        ["Draft materials you can review", "Generate an initial outline, rubric or bank of comments using fictional examples and material you may share. Check disciplinary accuracy, accessibility and alignment with learning outcomes. Personalize feedback and keep grades, accommodation details and identifiable submissions out of unauthorized tools"],
        ["Explain your own use", "Tell students where AI shaped the materials or activity, why you used it and how you checked the result. Ask for student feedback if the design creates an unexpected access barrier"]
      ], links: [["Explore inclusive course design ideas", "https://learningdesignviews.educ.ubc.ca/inclusive-content-and-ai/"]] },
      { id: "supervision", title: "Graduate supervision", items: [
        ["Set expectations at the start", "Discuss where AI fits your discipline and which uses are appropriate at each milestone. Talk through data sovereignty, rights, privacy and bias using the student’s proposed workflow. Consult the graduate program or scholarly body when norms are unclear"],
        ["Revisit the agreement", "Ask for a record of material AI use and discuss how it will be explained in writing and at the defence. Revisit the agreement when the student changes tools, data or methods"]
      ], links: [["Read about AI and academic supervision", "https://universityaffairs.ca/career-advice/career-advice-article/ai-higher-education-and-the-future-of-academic-supervision/"]] }
    ]
  },
  research: {
    audience: "Researchers and research teams",
    image: researchImage,
    topics: [
      { id: "approvals", title: "Ethics and data approvals", items: [
        ["Review the proposed workflow before collecting data", "Identify what will enter the tool, where it will be processed and stored, who can access it and how long it will be retained. For human participant research, check the approved protocol and consent. Consult Research Ethics about any required amendment before changing the workflow"],
        ["Protect restricted material", "Keep identifiable participant material, confidential partner information and embargoed drafts out of unauthorized services. Check data use agreements, licences, Indigenous data governance and data sovereignty requirements. Removing names alone may leave people identifiable"]
      ], links: [
        ["Contact York Research Ethics", "https://www.yorku.ca/research/research-ethics/human-participants-in-research/"],
        ["Find cybersecurity guidance for academia", "https://www.cyber.gc.ca/en/academia"]
      ] },
      { id: "methods", title: "Research methods and reporting", items: [
        ["Pilot before using research data", "Test a search, analysis or data cleaning method on synthetic inputs or material you are authorized to share. For literature screening, check the search against original publications and have a researcher confirm inclusion decisions"],
        ["Make the method reproducible", "Record the tool and version, purpose, inputs, material outputs and independent checks. Verify references, calculations and code. Describe material AI use when reporting your methods and check the destination journal’s disclosure and authorship rules"]
      ], links: [
        ["Open the York Libraries guide to using generative AI in research", "https://researchguides.library.yorku.ca/genairesearch"],
        ["Explore the York Libraries AI research guide", "https://researchguides.library.yorku.ca/AI"]
      ] },
      { id: "funding", title: "Grant applications and peer review", items: [
        ["Check the funding opportunity before using AI", "Read the funding opportunity’s instructions. The federal agencies hold applicants responsible for the accuracy and completeness of the application and for verifying and acknowledging every source. Keep confidential proposal material out of tools that cannot protect it"],
        ["Protect confidential review", "Federal research funding agencies prohibit using public, online or institutionally deployed generative AI tools to review funding applications. CIHR also prohibits automated transcription and summaries during peer review meetings and related discussions. Disability accommodations require CIHR approval in advance"]
      ], links: [
        ["Read federal granting agency guidance", "https://science.ised-isde.canada.ca/site/science/en/interagency-research-funding/policies-and-guidelines/guidance-use-artificial-intelligence-development-and-review-research-grant-proposals"],
        ["Read the CIHR peer review meeting policy", "https://cihr-irsc.gc.ca/e/54129.html"]
      ] },
      { id: "community", title: "AI research at York", items: [
        ["Find research groups", "York teams study how to design trustworthy AI systems, how people learn and create with digital tools, and how emerging technologies shape society. Explore the research groups below to identify potential collaborators"],
        ["Take research into practice", "Contact Innovation York for commercialization support, Osgoode’s IP Innovation Clinic for intellectual property resources or Lassonde’s BEST program for entrepreneurship"]
      ], links: [
        ["Centre for Artificial Intelligence and Society", "https://www.yorku.ca/research/cais/"],
        ["Centre for Innovation in Computing at Lassonde", "https://lassonde.yorku.ca/research/research-facilities-and-centres#h-centre-for-innovation-in-computing-lassonde"],
        ["Institute for Research on Digital Literacies", "https://irdl.info.yorku.ca/"],
        ["Institute for Technoscience and Society", "https://www.yorku.ca/research/its/"],
        ["Connected Minds", "https://www.yorku.ca/research/connected-minds/"],
        ["Lassonde computing research labs", "https://lassonde.yorku.ca/eecs/research/research-labs/"],
        ["Lassonde research facilities and centres", "https://lassonde.yorku.ca/research/research-facilities-and-centres"],
        ["Innovation York", "https://www.yorku.ca/research/innovation-partnerships/"],
        ["IP Innovation Clinic", "https://www.yorku.ca/osgoode/ip-innovation-clinic/"],
        ["Lassonde BEST entrepreneurship program", "https://lassonde.yorku.ca/best/"],
        ["Explore AI degrees and certificates", "#/partner"]
      ] }
    ]
  },
  work: {
    audience: "Staff and people managers",
    image: workImage,
    topics: [
      { id: "decide", title: "Decide when AI fits", items: [
        ["Start with low risk work", "Discuss your use with your supervisor and obtain management approval. Start with a template that uses fictional details, an agenda or a published page you have rights to use. Have a person who knows the work check the output for errors, bias and suitability"],
        ["Get oversight before higher impact work", "Discuss public communications, strategic decisions, meeting transcription and code that touches York systems or data with your supervisor before using AI. Identify AI-generated content in outward-facing communications and have an accountable person approve it. Involve Information Security for new integrations"],
        ["Keep people responsible for decisions", "York’s guidelines prohibit AI impersonation and expert or critical decisions without human oversight. Keep decisions about students or employees with the people and processes authorized to make them"]
      ], links: [
        ["Read York’s administrative AI guidelines", "https://www.yorku.ca/uit/cio/wp-content/uploads/sites/936/2025/07/Generative-AI-Guidelines_r2.1_July_2_2025.pdf"],
        ["Check a workplace scenario", "#/guide"]
      ] },
      { id: "data", title: "Handle York information", items: [
        ["Classify the input before sharing it", "Public information is intended for public access. Internal information includes non-public procedures and work drafts. Confidential information includes unpublished proposals, contracts and internal financial reports. Regulated information includes health, payment and student records"],
        ["Check the exact tool and configuration", "A personal or unsigned-in account lacks York’s enterprise protections. Use only approved tools with non-public York information. The administrative guidelines require explicit authorization through York’s assessment process before you enter personal, confidential or regulated information. Request a risk assessment before using a new chatbot or meeting assistant with York data"]
      ], links: [
        ["Read York’s information classification standard", "https://www.yorku.ca/secretariat/policies/policies/information-security-classification-standard/"],
        ["Check York’s Microsoft 365 data handling rules", "https://www.yorku.ca/uit/faculty-and-staff-services/microsoft-365-for-faculty-and-staff/handling-university-data-in-microsoft-365/"],
        ["Start a cyber threat and risk assessment", "https://www.yorku.ca/uit/infosec/ctra/"]
      ] },
      { id: "access", title: "Get workplace tools", items: [
        ["Copilot in a browser or Microsoft 365", "For browser chat, sign in with Passport York and confirm the Enterprise Data Protection shield. For Copilot inside Word, Excel, Outlook or Teams, ask UIT Administration for a paid Microsoft 365 Copilot licence and confirm the charge with your cost centre"],
        ["York managed assistants and coding tools", "For a YU AURA assistant, ask UIT about access, approved data sources and permissions for your use case. For York coding work, check eligibility for the university’s GitHub Copilot licence and keep institutional code out of personal accounts"],
        ["Meeting summaries in Zoom", "Enable Zoom AI Companion only for a suitable meeting. Notify participants, get consent and leave it off if anyone objects. Review the summary for accuracy, share it outside the meeting only on a need-to-know basis and delete it when it is no longer needed"]
      ], links: [
        ["Open Microsoft Copilot", "https://copilot.cloud.microsoft.com/"],
        ["Email UIT Administration about a licence", "mailto:uitadmin@yorku.ca"],
        ["Ask UIT about YU AURA or get technical help", "https://askus.yorku.ca/portal"],
        ["Get York GitHub access", "https://www.yorku.ca/uit/faculty-and-staff-services/github/"],
        ["Set up Zoom AI Companion", "https://lthelp.yorku.ca/ai-companion/introduction-to-zoom-ai-companion"],
        ["Read York’s meeting assistant guidelines", "https://www.yorku.ca/uit/cio/wp-content/uploads/sites/936/2026/02/Guidelines-AI-Chatbots-Assistants.pdf"]
      ] },
      { id: "training", title: "Workplace training", items: [
        ["Start with a real task and safe inputs", "The York learning package covers Copilot, YU AURA and AURA Chat with how-to guides and recorded sessions. People managers can use the workplace recording to prepare conversations about when a team needs oversight"]
      ], links: [
        ["Open the YU Learn workplace AI package with Passport York", "https://yulearn.yorku.ca/local/yulearn/learning_opportunity.php?id=1651"],
        ["Watch the people managers session with Passport York", "https://yulearn.yorku.ca/local/yulearn/learning_opportunity.php?id=1620"],
        ["Browse UIT’s AI prompt library", "https://www.yorku.ca/uit/faculty-and-staff-services/ai/prompt-library/"]
      ] }
    ]
  }
};

export function AudienceGuide({ kind, copy = pageCopy[kind], embedded = false }: { kind: Guide; copy?: PageCopy; embedded?: boolean }) {
  const { audience, image, topics } = guides[kind];
  const Title = embedded ? "h2" : "h1";
  const root = useRef<HTMLDivElement>(null);
  const headingId = (id: string) => `${kind}-${id}`;

  function jumpTo(id: string) {
    const heading = root.current?.querySelector<HTMLElement>(`#${headingId(id)}`);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView();
  }

  return <div ref={root} className={`audience-guide audience-guide--${kind}`}>
    <header className="audience-guide__hero">
      <div className="shell audience-guide__hero-inner">
        <div className="audience-guide__intro">
          <p className="audience-guide__audience">{audience}</p>
          <Title>{copy.title}</Title>
          <p className="audience-guide__lede">{copy.intro}</p>
        </div>
        <img src={image} alt="" />
      </div>
    </header>
    <div className="shell audience-guide__body">
      <nav className="audience-guide__index" aria-label="On this page">
        <h2>On this page</h2>
        <ul>{topics.map((topic) => <li key={topic.id}>
          <button type="button" onClick={() => jumpTo(topic.id)}>{topic.title}<span aria-hidden="true">↓</span></button>
        </li>)}</ul>
      </nav>
      <div className="audience-guide__topics">
        {topics.map(({ id, title, items, links, example }) => <section key={id} aria-labelledby={headingId(id)}>
          <h2 id={headingId(id)} tabIndex={-1}>{title}</h2>
          <div className="audience-guide__items">
            {items.map(([heading, text]) => <div key={heading}><h3>{heading}</h3><p>{text}</p></div>)}
          </div>
          {example && <aside className="audience-guide__example"><h3>{example[0]}</h3><p>{example[1]}</p></aside>}
          {links && <ul className="audience-guide__links">
            {links.map(([label, href]) => <li key={href}>
              <a href={href}>{label}<span aria-hidden="true">→</span></a>
            </li>)}
          </ul>}
        </section>)}
      </div>
    </div>
  </div>;
}
