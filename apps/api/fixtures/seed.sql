INSERT OR IGNORE INTO workspaces (id, expires_at, created_at)
VALUES ('seed-demo', '2099-01-01T00:00:00.000Z', '2025-01-01T00:00:00.000Z');
INSERT OR IGNORE INTO events (id, workspace_id, slug, title, payload_json, lifecycle, created_at)
VALUES ('seed-event', 'seed-demo', 'ai-york-open-studio', 'AI @ York Open Studio',
 '{"summary":"A fictional demonstration event for the AI @ York calendar.","date":"2099-01-15","startTime":"12:00","endTime":"13:00","allDay":false,"timezone":"America/Toronto","organizer":"AI @ York","location":"Online","audience":"York community"}',
 'published', '2025-01-01T00:00:00.000Z');
