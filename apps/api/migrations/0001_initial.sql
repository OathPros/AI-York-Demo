CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id_hash TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  role TEXT NOT NULL CHECK (role IN ('external', 'admin')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'in_review', 'drafted', 'published', 'declined')),
  receipt_hash TEXT NOT NULL,
  resulting_event_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  lifecycle TEXT NOT NULL CHECK (lifecycle IN ('draft', 'published')),
  created_at TEXT NOT NULL,
  UNIQUE(workspace_id, slug)
);
CREATE TABLE IF NOT EXISTS idempotency_keys (
  workspace_id TEXT NOT NULL,
  key TEXT NOT NULL,
  response_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY(workspace_id, key)
);
CREATE INDEX IF NOT EXISTS requests_workspace_status ON requests(workspace_id, status);
CREATE INDEX IF NOT EXISTS events_workspace_lifecycle ON events(workspace_id, lifecycle);
