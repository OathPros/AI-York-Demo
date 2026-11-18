CREATE TABLE IF NOT EXISTS reference_content (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('tool', 'source', 'guidance_case')),
  payload_json TEXT NOT NULL,
  imported_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reference_content_kind ON reference_content(kind);
