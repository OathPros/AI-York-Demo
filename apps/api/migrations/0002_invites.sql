CREATE TABLE IF NOT EXISTS invites (
  token_hash TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  capability TEXT NOT NULL CHECK (capability IN ('visitor', 'reviewer')),
  expires_at TEXT NOT NULL,
  redeemed_at TEXT,
  created_at TEXT NOT NULL
);
ALTER TABLE sessions ADD COLUMN can_admin INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS invites_workspace ON invites(workspace_id, capability);
