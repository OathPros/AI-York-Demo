import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourcePath = resolve("docs/references/homepage-wordpress-export.txt");
const outputPath = resolve("apps/api/fixtures/reference-content.json");
const sqlPath = resolve("apps/api/fixtures/reference-content.sql");
const source = await readFile(sourcePath, "utf8");
const line = source.split(/\r?\n/).find((candidate) => candidate.trimStart().startsWith("const DB="));
if (!line) throw new Error("Could not find the reference DB literal.");
const literal = line.trim().slice("const DB=".length).replace(/;$/, "");
const db = JSON.parse(literal);
if (!db.tools || !db.sources || !db.cases) throw new Error("Reference DB is missing required collections.");
if (db.cases.length !== 90) throw new Error(`Expected 90 guidance cases, found ${db.cases.length}.`);
await writeFile(outputPath, `${JSON.stringify({ importedAt: new Date().toISOString(), source: sourcePath, ...db }, null, 2)}\n`);
const importedAt = new Date().toISOString();
const sqlValue = (value) => `'${String(value).replaceAll("'", "''")}'`;
const rows = [
  ...Object.entries(db.tools).map(([id, payload]) => ["tool", id, payload]),
  ...Object.entries(db.sources).map(([id, payload]) => ["source", id, payload]),
  ...db.cases.map((payload) => ["guidance_case", payload.id, payload])
];
const sql = rows.map(([kind, id, payload]) => `INSERT OR REPLACE INTO reference_content (id, kind, payload_json, imported_at) VALUES (${sqlValue(id)}, ${sqlValue(kind)}, ${sqlValue(JSON.stringify(payload))}, ${sqlValue(importedAt)});`).join("\n");
await writeFile(sqlPath, `${sql}\n`);
console.log(`Imported ${db.cases.length} cases, ${Object.keys(db.tools).length} tools and ${Object.keys(db.sources).length} sources.`);
