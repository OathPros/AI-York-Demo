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
