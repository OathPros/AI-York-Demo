-- Shared "base" rows use workspace_id = 'base'. A workspace edit writes a row with the same
-- (collection, id) under the workspace id, which overrides the base row for that workspace only.
CREATE TABLE IF NOT EXISTS content_items (
  workspace_id TEXT NOT NULL,
  collection TEXT NOT NULL CHECK (collection IN ('policy', 'interpretation', 'tool', 'event', 'community', 'training')),
  id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  data_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (workspace_id, collection, id)
);
CREATE INDEX IF NOT EXISTS content_items_collection ON content_items(collection, status);
