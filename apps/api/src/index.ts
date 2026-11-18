import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import { eventSuggestionSchema, requestSchema, roleSchema, type DemoRole } from "@ai-york/contracts";

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
    c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
  if (!parsed.success) return jsonError("Check the highlighted event fields.");
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
  const request = await c.env.DB.prepare("SELECT * FROM requests WHERE id = ? AND workspace_id = ?").bind(requestId, c.get("workspaceId")).first<{ payload_json: string; status: string }>();
  if (!request) return jsonError("Request not found.", 404);
  if (action === "decline") {
    await c.env.DB.prepare("UPDATE requests SET status = 'declined', updated_at = ? WHERE id = ? AND workspace_id = ?").bind(now(), requestId, c.get("workspaceId")).run();
    return c.json({ status: "declined" });
  }
  if (action !== "publish") return jsonError("Supported actions are publish and decline.");
  const payload = eventSuggestionSchema.parse(JSON.parse(request.payload_json));
  const eventId = id("event");
  const slug = `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${eventId.slice(-8)}`;
  await c.env.DB.batch([
    c.env.DB.prepare("INSERT INTO events (id, workspace_id, slug, title, payload_json, lifecycle, created_at) VALUES (?, ?, ?, ?, ?, 'published', ?)").bind(eventId, c.get("workspaceId"), slug, payload.title, JSON.stringify({ ...payload, summary: "Published from an AI @ York demo suggestion." }), now()),
    c.env.DB.prepare("UPDATE requests SET status = 'published', resulting_event_id = ?, updated_at = ? WHERE id = ? AND workspace_id = ?").bind(eventId, now(), requestId, c.get("workspaceId"))
  ]);
  return c.json({ status: "published", event: { id: eventId, slug } });
});

app.get("/api/v1/public/:workspaceId/events", async (c) => {
  const rows = await c.env.DB.prepare("SELECT id, slug, title, payload_json FROM events WHERE workspace_id = ? AND lifecycle = 'published' ORDER BY json_extract(payload_json, '$.date')").bind(c.req.param("workspaceId")).all();
  return c.json({ events: rows.results.map((row) => ({ id: row.id, slug: row.slug, title: row.title, ...JSON.parse(String(row.payload_json)), status: "published" })) });
});

app.get("/api/v1/public/:workspaceId/events/:slug", async (c) => {
  const row = await c.env.DB.prepare("SELECT id, slug, title, payload_json FROM events WHERE workspace_id = ? AND slug = ? AND lifecycle = 'published'").bind(c.req.param("workspaceId"), c.req.param("slug")).first<{ id: string; slug: string; title: string; payload_json: string }>();
  if (!row) return jsonError("Event not found.", 404);
  return c.json({ event: { id: row.id, slug: row.slug, title: row.title, ...JSON.parse(row.payload_json), status: "published" } });
});

app.get("/api/v1/public/:workspaceId/reference", async (c) => {
  const rows = await c.env.DB.prepare("SELECT id, kind, payload_json FROM reference_content ORDER BY kind, id").all<{ id: string; kind: string; payload_json: string }>();
  const reference = { tools: {} as Record<string, unknown>, sources: {} as Record<string, unknown>, cases: [] as unknown[] };
  for (const row of rows.results) {
    const payload = JSON.parse(row.payload_json);
    if (row.kind === "tool") reference.tools[row.id] = payload;
    else if (row.kind === "source") reference.sources[row.id] = payload;
    else reference.cases.push(payload);
  }
  return c.json({ reference });
});

export default app;
