import React from "react";

const migratedRoutes: Record<string, string> = {
  "/teachingandlearning/gen-ai": "#/learning",
  "/teachingandlearning/gen-ai/gen-ai-101": "#/learning",
  "/teachingandlearning/gen-ai/for-students": "#/study",
  "/teachingandlearning/gen-ai/for-faculty": "#/teach"
};

export function migratedLearningHref(href: string) {
  try {
    const url = new URL(href);
    if (url.host === "www.yorku.ca" || url.host === "yorku.ca") {
      return migratedRoutes[url.pathname.replace(/\/+$/, "")];
    }
  } catch {
    // Relative and malformed URLs do not identify a migrated York page.
  }
  return undefined;
}

export function LearningGuide() {
  return <div id="york-learning-guide">
    <section className="section" aria-labelledby="learning-heading">
      <h1 id="learning-heading">AI learning at York</h1>
      <p className="lead">Learn how generative AI works, then apply it to studying, teaching or a task in your role</p>
      <ul className="learning-routes">
        <li><a className="text-link" href="#/study">Study with AI</a><p>Check course rules and use AI for practice</p></li>
        <li><a className="text-link" href="#/teach">Teach with AI</a><p>Set expectations and design assessments</p></li>
        <li><a className="text-link" href="#/research">Research with AI</a><p>Evaluate tools and protect research data</p></li>
        <li><a className="text-link" href="#/work">Use AI at work</a><p>Choose supported tools for administrative tasks</p></li>
      </ul>
    </section>
    <section className="section" aria-labelledby="fundamentals-heading">
      <h2 id="fundamentals-heading">Generative AI fundamentals</h2>
      <p>Generative AI creates text, images, audio or code from patterns learned during training. A language model can draft, rephrase and explain, but it can also invent facts and citations, reproduce bias or miss recent developments. Verify important claims against original sources</p>
      <ol className="learning-steps">
        <li><strong>Choose a suitable task</strong><p>Start with a low-stakes task such as brainstorming, exploring a concept or practising with fictional data. Check course rules, tool access and whether you may share the information before entering it</p></li>
        <li><strong>Write a prompt you can test</strong><p>Describe the task, audience and desired output. Supply context you are authorized to share, set boundaries, and ask the tool to flag assumptions or missing information</p></li>
        <li><strong>Check and revise the result</strong><p>Compare claims with the primary source, recalculate numbers and inspect code before using it. Look for missing perspectives, stereotypes and accessibility issues. Refine the prompt when the result falls short</p></li>
        <li><strong>Take responsibility for the final work</strong><p>Keep a record of the tool and how you used it when documentation is required. Follow the relevant disclosure rules and submit or share only material you have checked and can explain</p></li>
      </ol>
      <div className="field-example">
        <h3>Practise writing a prompt</h3>
        <p>Explain sampling bias to a first-year student using a fictional campus survey. Give one example, pose a practice question and wait for my answer before showing the solution</p>
        <p>Compare the explanation with your course material. Revise the prompt if it confuses sampling bias with a small sample size</p>
      </div>
      <p><a className="text-link" href="#/tools">Compare York supported tools</a></p>
    </section>
  </div>;
}

export function StudyGuidance() {
  return <section className="shell workplace-examples" aria-labelledby="study-guidance-heading">
    <h2 id="study-guidance-heading">Use AI within course rules</h2>
    <ol className="learning-steps">
      <li><strong>Check the rules for this assignment</strong><p>Read the course outline and assignment instructions. Ask your instructor if brainstorming, translation, proofreading, debugging or using a writing assistant is unclear. Permission to use AI for practice may differ from permission to use it on an assessment</p></li>
      <li><strong>Choose a use that helps you learn</strong><p>When permitted, ask for practice questions, a hint, a second explanation or feedback on a draft. Solve the problem or write the argument yourself. Follow the same checks for take-home tests, quizzes, lab work and code</p></li>
      <li><strong>Protect course material and personal information</strong><p>Use public or fictional examples when possible. Get permission before sharing course slides, unpublished materials or someone else’s work. Check instructor approval, consent and privacy requirements before recording or transcribing a class</p></li>
      <li><strong>Verify and disclose your use</strong><p>Open and read every source you plan to cite. Check calculations and make sure you can explain your reasoning. Follow your course’s directions for acknowledgement, citation and records of prompts or outputs</p></li>
    </ol>
    <div className="field-example">
      <h3>Try an active recall exercise</h3>
      <p>Ask for five questions on a topic you may share, with answers held back. Answer them on your own, then check the feedback against your notes</p>
      <h3>Keep a simple disclosure record</h3>
      <p>If your instructor asks for a disclosure, record the tool, the task it helped with and what you verified or changed. For example, I used Copilot to generate practice questions. I checked them against the course notes and wrote my submission independently</p>
    </div>
    <p><a className="text-link" href="#/learning">Review the AI fundamentals</a></p>
  </section>;
}

export function TeachingGuidance() {
  return <section className="shell workplace-examples" aria-labelledby="teaching-practice-heading">
    <h2 id="teaching-practice-heading">Design a course approach</h2>
    <ol className="learning-steps">
      <li><strong>Start from the learning outcome</strong><p>Identify the thinking or skill students must demonstrate independently. Decide which steps could benefit from AI practice and where using it would bypass the intended learning</p></li>
      <li><strong>Publish permitted uses for each assessment</strong><p>Show examples of allowed and restricted assistance, the expected disclosure, and how the work will be assessed. Explain whether the rules differ for brainstorming, translating, editing, coding or generating answers</p></li>
      <li><strong>Make the learning visible</strong><p>Ask for an annotated draft, source notes, a short explanation of decisions or a comparison between an AI answer and course evidence. Give students a way to demonstrate the same learning if they lack access or need an accessible alternative</p></li>
      <li><strong>Protect student work and review the results</strong><p>Use fictional examples when drafting materials or rubrics. Keep grades, submissions and accommodations out of unauthorized tools. Review examples and rubrics for accuracy, bias and accessibility, and keep grading decisions with instructors</p></li>
    </ol>
    <div className="field-example">
      <h3>Example assignment statement</h3>
      <p>You may use AI to brainstorm research questions for this assignment. Write your own argument, verify every citation, and include a brief note identifying the tool and how it helped you. Use course readings and your own analysis as evidence</p>
      <p>For an activity that teaches evaluation, give everyone the same sample AI answer. Ask students to verify its claims and explain two changes using course sources</p>
    </div>
    <p><a className="text-link" href="#/study">Share the student guide</a></p>
    <p><a className="text-link" href="https://www.yorku.ca/teachingcommons/artificial-intelligence-ai-pedagogies/">Find Teaching Commons workshops</a></p>
  </section>;
}
