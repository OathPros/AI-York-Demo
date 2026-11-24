import React from "react";

export function DemoBanner({ onSuggest, onOpenStudio, publicNotice = true, nextStepsCurrent = false }: { onSuggest?: () => void; onOpenStudio?: () => void; publicNotice?: boolean; nextStepsCurrent?: boolean }) {
  return <div className="demo-banner" role="note">
    <div className="demo-banner__message">{publicNotice ? <span>Demonstration website. Some content, activities and records are illustrative and do not represent official York University guidance.</span> : <><strong>Demonstration</strong><span>Content, names and events may be illustrative and are not official York guidance. Roles and approvals are simulated; requests stay in this workspace and policy edits stay in this browser. Do not enter sensitive information.</span></>}</div>
    {onSuggest && onOpenStudio && <div className="demo-banner__actions">{publicNotice && <a href="#/next-steps" aria-current={nextStepsCurrent ? "page" : undefined}>Next steps</a>}<button onClick={onSuggest}>Suggest a change</button><button onClick={onOpenStudio}>Open Studio</button></div>}
  </div>;
}
