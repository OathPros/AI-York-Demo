CREATE TABLE requests_new (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'in_review', 'drafted', 'published', 'resolved', 'declined')),
  receipt_hash TEXT NOT NULL,
  resulting_event_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO requests_new SELECT id, workspace_id, kind, payload_json, status, receipt_hash, resulting_event_id, created_at, updated_at FROM requests;
DROP TABLE requests;
ALTER TABLE requests_new RENAME TO requests;
CREATE INDEX IF NOT EXISTS requests_workspace_status ON requests(workspace_id, status);
