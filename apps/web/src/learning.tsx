import React from "react";

const migratedRoutes: Record<string, string> = {
  "/teachingandlearning/gen-ai": "#/learning",
  "/teachingandlearning/gen-ai/gen-ai-101": "#/learning",
  "/teachingandlearning/gen-ai/for-students": "#/study",
  "/teachingandlearning/gen-ai/for-faculty": "#/teach",
  "/teachingandlearning/gen-ai/graduate-studies-resources": "#/study",
  "/research/use-of-artificial-intelligence-york": "#/research",
  "/uit/cio/artificial-intelligence-initiative": "#/work",
  "/uit/faculty-and-staff-services/ai": "#/work"
};

export function migratedResourceHref(href: string) {
  try {
    const url = new URL(href);
    if (url.host === "www.yorku.ca" || url.host === "yorku.ca") {
      return migratedRoutes[url.pathname.replace(/\/+$/, "").toLowerCase()];
    }
  } catch {
    // Relative and malformed URLs do not identify a migrated York page.
  }
  return undefined;
}

export function LearningGuide() {
  return <div id="york-learning-guide">
    <section className="section" aria-labelledby="learning-heading">
      <h1 id="learning-heading">AI training at York</h1>
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
