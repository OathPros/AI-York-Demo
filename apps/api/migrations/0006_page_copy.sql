CREATE TABLE page_copy (
  workspace_id TEXT NOT NULL,
  page TEXT NOT NULL,
  draft TEXT NOT NULL,
  published TEXT,
  PRIMARY KEY (workspace_id, page)
);
