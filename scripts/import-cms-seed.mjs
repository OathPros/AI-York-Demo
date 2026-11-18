import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Builds the shared "base" CMS rows from the reference exports. Run after `npm run import:reference`.
const fixture = JSON.parse(await readFile(resolve("apps/api/fixtures/reference-content.json"), "utf8"));
const homepage = await readFile(resolve("docs/references/homepage-v2-export.txt"), "utf8");
const sqlValue = (value) => `'${String(value).replaceAll("'", "''")}'`;
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&gt;", ">").replaceAll("&lt;", "<").replaceAll("&quot;", '"').replaceAll("&#039;", "'").trim();
const stamp = new Date().toISOString();
const rows = [];
const add = (collection, id, title, data) => rows.push({ collection, id, title, data });

const toolMeta = {
  student: { audience: "students", activities: ["study", "research"] },
  web: { audience: "all", activities: ["study", "teach", "research", "work"] },
  premium: { audience: "staff", activities: ["work", "teach", "research"] },
  aura: { audience: "staff", activities: ["work", "teach", "research"] },
  github: { audience: "staff", activities: ["work", "research"] },
  zoom: { audience: "staff", activities: ["work", "teach"] }
};
for (const [id, tool] of Object.entries(fixture.tools)) add("tool", id, tool.name, { name: tool.name, url: tool.url, scope: tool.scope, ...(toolMeta[id] ?? { audience: "all", activities: [] }) });

const policyActivities = {
  student: ["study"], academic: ["study", "teach", "research"], study: ["study"], admin: ["work"], staff: ["work"], class: ["teach"],
  research: ["research"], ethics: ["research"], classifications: ["work", "research"], meeting: ["work"], zoom: ["work", "teach"]
};
for (const [id, [title, url]] of Object.entries(fixture.sources)) add("policy", id, title, { title, summary: "", url, owner: "", effectiveDate: "", activities: policyActivities[id] ?? [] });

const taskLabels = Object.fromEntries(Object.entries(fixture.tasks).map(([activity, list]) => [activity, Object.fromEntries(list)]));
for (const item of fixture.cases) {
  const { id, ...rest } = item;
  add("interpretation", id, item.title, { ...rest, taskLabel: taskLabels[item.activity]?.[item.task] ?? item.title, approval_note: item.approval_note ?? "" });
}

const pathwayTags = { admin: ["work"], academic: ["teach"], credentials: ["partner", "study"] };
const pathwayNames = { admin: "Workplace learning", academic: "Teaching and course design", credentials: "Formal study and professional development" };
for (const match of homepage.matchAll(/yl-pathway yl-pathway--(\w+)">([\s\S]*?)<\/ul>/g)) {
  const [, key, block] = match;
  for (const link of block.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)) {
    const title = decode(link[2]);
    add("training", `pathway-${key}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, title, { title, summary: "", url: decode(link[1]), format: pathwayNames[key], tags: pathwayTags[key] });
  }
}
for (const match of homepage.matchAll(/<article class="yl-card" data-yl-tags="([^"]+)">([\s\S]*?)<\/article>/g)) {
  const [, tagText, block] = match;
  const pick = (re) => decode(block.match(re)?.[1] ?? "");
  const title = pick(/<h4>([^<]+)<\/h4>/);
  const known = new Set(["basics", "work", "teach", "study", "tools"]);
  add("training", `resource-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`, title, {
    title, summary: pick(/<\/div>\s*<h4>[^<]*<\/h4>\s*<p>([^<]+)<\/p>/), url: pick(/<a href="([^"]+)"/), format: pick(/yl-card-type">([^<]+)</), tags: tagText.split(/\s+/).filter((tag) => known.has(tag))
  });
}

const counts = rows.reduce((acc, row) => ({ ...acc, [row.collection]: (acc[row.collection] ?? 0) + 1 }), {});
if (counts.tool !== 6 || counts.interpretation !== 90 || counts.policy !== 11 || (counts.training ?? 0) < 12) throw new Error(`Unexpected seed counts: ${JSON.stringify(counts)}`);
const sql = rows.map((row) => `INSERT OR REPLACE INTO content_items (workspace_id, collection, id, title, status, data_json, created_at, updated_at) VALUES ('base', ${sqlValue(row.collection)}, ${sqlValue(row.id)}, ${sqlValue(row.title)}, 'published', ${sqlValue(JSON.stringify(row.data))}, ${sqlValue(stamp)}, ${sqlValue(stamp)});`).join("\n");
await writeFile(resolve("apps/api/fixtures/cms-base.sql"), `${sql}\n`);
console.log("Wrote cms-base.sql", counts);
