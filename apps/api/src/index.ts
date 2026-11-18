import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import { contentCollectionSchema, contentCollections, contentSchemas, contentWriteSchema, eventSuggestionSchema, requestSchema, roleSchema, type ContentBundle, type ContentCollection, type ContentItem, type ContentStatus, type DemoRole } from "@ai-york/contracts";

type AppEnv = { Bindings: Env; Variables: { workspaceId: string; role: DemoRole } };
const app = new Hono<AppEnv>();

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const token = () => `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
async function digest(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: { message } }), { status, headers: { "content-type": "application/json" } });
}
function cookieName() { return "ai_york_demo_session"; }
function sessionToken(c: Context) {
  const bearer = c.req.header("Authorization")?.match(/^Bearer (.+)$/)?.[1];
  return bearer || getCookie(c, cookieName());
}

app.use("*", async (c, next) => {
  const origins = (c.env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
  const origin = c.req.header("Origin");
  if (origin && origins.includes(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Vary", "Origin");
  }
  if (c.req.method === "OPTIONS") {
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key");
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return c.body(null, 204);
  }
  await next();
});

app.get("/health", (c) => c.json({ ok: true, database: Boolean(c.env.DB) }));

app.post("/api/v1/demo/start", async (c) => {
  const workspaceId = id("ws");
  const session = token();
  const timestamp = now();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO workspaces (id, expires_at, created_at) VALUES (?, ?, ?)").bind(workspaceId, expires, timestamp),
    c.env.DB.prepare("INSERT INTO sessions (id_hash, workspace_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(await digest(session), workspaceId, "external", expires, timestamp)
  ]);
  setCookie(c, cookieName(), session, { httpOnly: true, secure: c.req.url.startsWith("https:"), sameSite: "Lax", maxAge: 60 * 60 * 8, path: "/" });
  return c.json({ workspaceId, role: "external", sessionToken: session });
});

app.post("/api/v1/demo/redeem", async (c) => {
  const invite = String((await c.req.json()).invite || "");
  if (invite.length < 32) return jsonError("This visitor link is invalid.", 401);
  const inviteRow = await c.env.DB.prepare("SELECT workspace_id, capability, expires_at FROM invites WHERE token_hash = ? AND (capability = 'visitor' OR redeemed_at IS NULL) AND expires_at > ?").bind(await digest(invite), now()).first<{ workspace_id: string; capability: "visitor" | "reviewer"; expires_at: string }>();
  if (!inviteRow) return jsonError("This visitor link has expired or was already used.", 401);
  const session = token();
  const timestamp = now();
  const sessionExpires = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE invites SET redeemed_at = ? WHERE token_hash = ? AND capability = 'reviewer' AND redeemed_at IS NULL").bind(timestamp, await digest(invite)),
    c.env.DB.prepare("INSERT INTO sessions (id_hash, workspace_id, role, expires_at, created_at, can_admin) VALUES (?, ?, ?, ?, ?, ?)").bind(await digest(session), inviteRow.workspace_id, inviteRow.capability === "reviewer" ? "admin" : "external", sessionExpires, timestamp, inviteRow.capability === "reviewer" ? 1 : 0)
  ]);
  setCookie(c, cookieName(), session, { httpOnly: true, secure: c.req.url.startsWith("https:"), sameSite: "Lax", maxAge: 60 * 60 * 8, path: "/" });
  return c.json({ workspaceId: inviteRow.workspace_id, role: inviteRow.capability === "reviewer" ? "admin" : "external", sessionToken: session });
});

app.post("/api/v1/demo/role", async (c) => {
  const parsed = roleSchema.safeParse((await c.req.json()).role);
  if (!parsed.success) return jsonError("Choose a supported demo role.");
  const session = sessionToken(c);
  if (!session) return jsonError("Start a demo workspace first.", 401);
  const sessionHash = await digest(session);
  const sessionRow = await c.env.DB.prepare("SELECT can_admin FROM sessions WHERE id_hash = ? AND expires_at > ?").bind(sessionHash, now()).first<{ can_admin: number }>();
  if (parsed.data === "admin" && !sessionRow?.can_admin) return jsonError("This visitor link cannot open Studio.", 403);
  const result = await c.env.DB.prepare("UPDATE sessions SET role = ? WHERE id_hash = ? AND expires_at > ?").bind(parsed.data, sessionHash, now()).run();
  if (!result.success || !result.meta.changes) return jsonError("Demo session expired.", 401);
  return c.json({ role: parsed.data });
});

app.use("/api/v1/*", async (c, next) => {
  if (c.req.path.endsWith("/demo/start") || c.req.path.endsWith("/demo/redeem") || c.req.path.endsWith("/health") || c.req.path.includes("/public/")) return next();
  const session = sessionToken(c);
  if (!session) return jsonError("Demo session required.", 401);
  const row = await c.env.DB.prepare("SELECT workspace_id, role FROM sessions WHERE id_hash = ? AND expires_at > ?").bind(await digest(session), now()).first<{ workspace_id: string; role: DemoRole }>();
  if (!row) return jsonError("Demo session expired.", 401);
  c.set("workspaceId", row.workspace_id);
  c.set("role", row.role);
  await next();
});

app.post("/api/v1/studio/invites", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  const capability = (await c.req.json()).capability === "reviewer" ? "reviewer" : "visitor";
  const rawToken = token();
  const expires = new Date(Date.now() + (capability === "reviewer" ? 1000 * 60 * 60 : 1000 * 60 * 60 * 24)).toISOString();
  await c.env.DB.prepare("INSERT INTO invites (token_hash, workspace_id, capability, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(await digest(rawToken), c.get("workspaceId"), capability, expires, now()).run();
  return c.json({ capability, expiresAt: expires, token: rawToken });
});

app.post("/api/v1/requests", async (c) => {
  if (c.get("role") !== "external") return jsonError("Only the external demo role can submit suggestions.", 403);
  const body = await c.req.json();
  const parsed = requestSchema.safeParse({ ...body, idempotencyKey: body.idempotencyKey || c.req.header("X-Idempotency-Key") });
  if (!parsed.success) return jsonError("Check the highlighted fields.");
  const workspaceId = c.get("workspaceId");
  const existing = await c.env.DB.prepare("SELECT response_json FROM idempotency_keys WHERE workspace_id = ? AND key = ?").bind(workspaceId, parsed.data.idempotencyKey).first<{ response_json: string }>();
  if (existing) return c.json(JSON.parse(existing.response_json));
  const requestId = id("req");
  const receipt = token();
  const response = { reference: requestId, status: "received", receiptSecret: receipt };
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO requests (id, workspace_id, kind, payload_json, status, receipt_hash, created_at, updated_at) VALUES (?, ?, ?, ?, 'received', ?, ?, ?)").bind(requestId, workspaceId, parsed.data.kind, JSON.stringify(parsed.data.payload), await digest(receipt), now(), now()),
    c.env.DB.prepare("INSERT INTO idempotency_keys (workspace_id, key, response_json, created_at) VALUES (?, ?, ?, ?)").bind(workspaceId, parsed.data.idempotencyKey, JSON.stringify(response), now())
  ]);
  return c.json(response, 201);
});

app.get("/api/v1/studio/requests", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  const rows = await c.env.DB.prepare("SELECT id, kind, payload_json, status, created_at FROM requests WHERE workspace_id = ? ORDER BY created_at DESC").bind(c.get("workspaceId")).all();
  return c.json({ requests: rows.results.map((row) => ({ ...row, payload: JSON.parse(String(row.payload_json)) })) });
});

app.post("/api/v1/studio/requests/:id/actions", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  const requestId = c.req.param("id");
  const action = (await c.req.json()).action;
  const request = await c.env.DB.prepare("SELECT * FROM requests WHERE id = ? AND workspace_id = ?").bind(requestId, c.get("workspaceId")).first<{ payload_json: string; status: string; kind: string }>();
  if (!request) return jsonError("Request not found.", 404);
  if (request.status !== "received") return jsonError("This request has already been handled.", 409);
  if (action === "decline") {
    await c.env.DB.prepare("UPDATE requests SET status = 'declined', updated_at = ? WHERE id = ? AND workspace_id = ?").bind(now(), requestId, c.get("workspaceId")).run();
    return c.json({ status: "declined" });
  }
  if (action === "resolve") {
    if (request.kind === "event" || request.kind === "training") return jsonError("Calendar items must be published, not resolved.");
    await c.env.DB.prepare("UPDATE requests SET status = 'resolved', updated_at = ? WHERE id = ? AND workspace_id = ?").bind(now(), requestId, c.get("workspaceId")).run();
    return c.json({ status: "resolved" });
  }
  if (action !== "publish") return jsonError("Supported actions are publish, resolve and decline.");
  if (request.kind !== "event" && request.kind !== "training") return jsonError("Only events and trainings can be published to the calendar. Mark other changes as resolved.");
  const payload = eventSuggestionSchema.parse(JSON.parse(request.payload_json));
  const eventId = id("event");
  const { referringPage: _referringPage, ...eventData } = payload;
  const data = { ...eventData, summary: "Published from an AI @ York demo suggestion." };
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO content_items (workspace_id, collection, id, title, status, data_json, created_at, updated_at) VALUES (?, 'event', ?, ?, 'published', ?, ?, ?)").bind(c.get("workspaceId"), eventId, payload.title, JSON.stringify(data), now(), now()),
    c.env.DB.prepare("UPDATE requests SET status = 'published', resulting_event_id = ?, updated_at = ? WHERE id = ? AND workspace_id = ?").bind(eventId, now(), requestId, c.get("workspaceId"))
  ]);
  return c.json({ status: "published", event: { id: eventId } });
});

type ContentRow = { workspace_id: string; collection: ContentCollection; id: string; title: string; status: ContentStatus; data_json: string };
async function loadContent(db: D1Database, workspaceId: string | null, includeUnpublished: boolean) {
  const rows = await db.prepare("SELECT workspace_id, collection, id, title, status, data_json FROM content_items WHERE workspace_id IN ('base', ?) ORDER BY workspace_id = 'base' DESC, rowid").bind(workspaceId ?? "base").all<ContentRow>();
  const merged = new Map<string, ContentRow>();
  for (const row of rows.results) merged.set(`${row.collection}|${row.id}`, row);
  const bundle = Object.fromEntries(contentCollections.map((name) => [name, [] as ContentItem[]])) as unknown as ContentBundle;
  for (const row of merged.values()) {
    if (!includeUnpublished && row.status !== "published") continue;
    bundle[row.collection].push({ id: row.id, collection: row.collection, title: row.title, status: row.status, origin: row.workspace_id === "base" ? "base" : "workspace", data: JSON.parse(row.data_json) });
  }
  bundle.event.sort((a, b) => String(a.data.date).localeCompare(String(b.data.date)));
  return bundle;
}

app.get("/api/v1/public/content", async (c) => c.json({ content: await loadContent(c.env.DB, null, false) }));
app.get("/api/v1/public/:workspaceId/content", async (c) => c.json({ content: await loadContent(c.env.DB, c.req.param("workspaceId"), false) }));

function parseCollection(name: string) {
  const parsed = contentCollectionSchema.safeParse(name);
  return parsed.success ? parsed.data : null;
}
function itemTitle(data: Record<string, unknown>) { return String(data.title ?? data.name ?? ""); }

app.get("/api/v1/studio/content", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  return c.json({ content: await loadContent(c.env.DB, c.get("workspaceId"), true) });
});

async function saveContent(c: Context<AppEnv>, collection: ContentCollection, itemId: string, isCreate: boolean) {
  const body = contentWriteSchema.safeParse(await c.req.json().catch(() => null));
  if (!body.success) return jsonError("Send a status and data object.");
  const data = contentSchemas[collection].safeParse(body.data.data);
  if (!data.success) return jsonError(`Check the fields: ${data.error.issues.map((issue) => `${issue.path.join(".") || "data"} ${issue.message}`).join("; ")}`);
  const workspaceId = c.get("workspaceId");
  if (!isCreate) {
    const visible = await c.env.DB.prepare("SELECT 1 AS ok FROM content_items WHERE workspace_id IN ('base', ?) AND collection = ? AND id = ?").bind(workspaceId, collection, itemId).first();
    if (!visible) return jsonError("Item not found.", 404);
  }
  await c.env.DB.prepare("INSERT INTO content_items (workspace_id, collection, id, title, status, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(workspace_id, collection, id) DO UPDATE SET title = excluded.title, status = excluded.status, data_json = excluded.data_json, updated_at = excluded.updated_at")
    .bind(workspaceId, collection, itemId, itemTitle(data.data), body.data.status, JSON.stringify(data.data), now(), now()).run();
  return c.json({ id: itemId, status: body.data.status }, isCreate ? 201 : 200);
}

app.post("/api/v1/studio/content/:collection", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  const collection = parseCollection(c.req.param("collection"));
  if (!collection) return jsonError("Unknown collection.", 404);
  return saveContent(c, collection, id(collection), true);
});

app.put("/api/v1/studio/content/:collection/:itemId", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  const collection = parseCollection(c.req.param("collection"));
  if (!collection) return jsonError("Unknown collection.", 404);
  return saveContent(c, collection, c.req.param("itemId"), false);
});

app.delete("/api/v1/studio/content/:collection/:itemId", async (c) => {
  if (c.get("role") !== "admin") return jsonError("Admin demo role required.", 403);
  const collection = parseCollection(c.req.param("collection"));
  if (!collection) return jsonError("Unknown collection.", 404);
  const workspaceId = c.get("workspaceId");
  const row = await c.env.DB.prepare("SELECT title, data_json FROM content_items WHERE workspace_id IN ('base', ?) AND collection = ? AND id = ? ORDER BY workspace_id = 'base' LIMIT 1").bind(workspaceId, collection, c.req.param("itemId")).first<{ title: string; data_json: string }>();
  if (!row) return jsonError("Item not found.", 404);
  await c.env.DB.prepare("INSERT INTO content_items (workspace_id, collection, id, title, status, data_json, created_at, updated_at) VALUES (?, ?, ?, ?, 'archived', ?, ?, ?) ON CONFLICT(workspace_id, collection, id) DO UPDATE SET status = 'archived', updated_at = excluded.updated_at")
    .bind(workspaceId, collection, c.req.param("itemId"), row.title, row.data_json, now(), now()).run();
  return c.json({ status: "archived" });
});

export default app;
