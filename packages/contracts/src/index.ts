import { z } from "zod";

export const roleSchema = z.enum(["external", "admin"]);
export type DemoRole = z.infer<typeof roleSchema>;

export const changeTypes = ["event", "training", "broken_link", "correction", "new_resource", "other"] as const;
export const changeTypeSchema = z.enum(changeTypes);
export type ChangeType = z.infer<typeof changeTypeSchema>;
export const changeTypeLabels: Record<ChangeType, string> = {
  event: "Event",
  training: "Training or workshop",
  broken_link: "Broken link",
  correction: "Content correction",
  new_resource: "New resource or tool",
  other: "Something else"
};

export const eventSuggestionSchema = z.object({
  type: z.enum(["event", "training"]),
  title: z.string().trim().min(3).max(160),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  allDay: z.boolean(),
  timezone: z.string().min(1).max(64),
  organizer: z.string().trim().min(2).max(160),
  location: z.string().trim().max(240).optional(),
  onlineLink: z.string().url().max(500).optional().or(z.literal("")),
  audience: z.string().trim().min(2).max(160),
  sourceUrl: z.string().url().max(500).optional().or(z.literal("")),
  referringPage: z.string().max(500)
});
export type EventSuggestion = z.infer<typeof eventSuggestionSchema>;

const optionalUrl = z.string().url().max(500).optional().or(z.literal(""));
const details = z.string().trim().min(5).max(2000);

export const brokenLinkSchema = z.object({
  type: z.literal("broken_link"),
  title: z.string().trim().min(3).max(160),
  pageUrl: z.string().trim().min(1).max(500),
  brokenUrl: optionalUrl,
  details: details.optional().or(z.literal("")),
  referringPage: z.string().max(500)
});
export const correctionSchema = z.object({
  type: z.literal("correction"),
  title: z.string().trim().min(3).max(160),
  pageUrl: z.string().trim().min(1).max(500),
  details,
  sourceUrl: optionalUrl,
  referringPage: z.string().max(500)
});
export const newResourceSchema = z.object({
  type: z.literal("new_resource"),
  title: z.string().trim().min(3).max(160),
  sourceUrl: optionalUrl,
  details,
  referringPage: z.string().max(500)
});
export const otherSuggestionSchema = z.object({
  type: z.literal("other"),
  title: z.string().trim().min(3).max(160),
  details,
  referringPage: z.string().max(500)
});

export const suggestionPayloadSchema = z.discriminatedUnion("type", [
  eventSuggestionSchema,
  brokenLinkSchema,
  correctionSchema,
  newResourceSchema,
  otherSuggestionSchema
]);
export type SuggestionPayload = z.infer<typeof suggestionPayloadSchema>;

export const requestSchema = z.object({
  kind: changeTypeSchema,
  payload: suggestionPayloadSchema,
  idempotencyKey: z.string().min(16).max(128)
}).refine((value) => value.kind === value.payload.type, { message: "Kind must match payload type.", path: ["kind"] });
export type CreateRequest = z.infer<typeof requestSchema>;

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  timezone: string;
  organizer: string;
  location?: string;
  onlineLink?: string;
  audience: string;
  type?: "event" | "training";
  status: "published";
};

export const contentCollections = ["policy", "interpretation", "tool", "event", "community", "training"] as const;
export const contentCollectionSchema = z.enum(contentCollections);
export type ContentCollection = z.infer<typeof contentCollectionSchema>;
export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;
export const activitySchema = z.enum(["study", "teach", "research", "work"]);
export type Activity = z.infer<typeof activitySchema>;
export const editablePageSchema = z.enum(["home", "study", "teach", "research", "work", "partner"]);
export type EditablePage = z.infer<typeof editablePageSchema>;
export const pageCopySchema = z.object({
  title: z.string().trim().min(2).max(120),
  intro: z.string().trim().min(10).max(900)
});
export type PageCopy = z.infer<typeof pageCopySchema>;
export const dataClassSchema = z.enum(["none", "public", "internal", "sensitive", "unsure"]);

const text = (max: number) => z.string().trim().max(max);
const linkOrBlank = z.string().trim().url().max(500).or(z.literal(""));
const activities = z.array(activitySchema).max(4);

export const policyItemSchema = z.object({
  title: text(200).min(3),
  summary: text(2000).default(""),
  url: linkOrBlank.default(""),
  owner: text(200).default(""),
  effectiveDate: text(40).default(""),
  activities
});
export const interpretationItemSchema = z.object({
  title: text(200).min(3),
  activity: activitySchema,
  task: text(40).min(2),
  taskLabel: text(200).default(""),
  data: dataClassSchema,
  example_use: text(1000).default(""),
  green: text(2000).default(""),
  yellow: text(2000).default(""),
  red: text(2000).default(""),
  tool_ids: z.array(z.string().max(80)).max(20),
  tool_advice: text(2000).default(""),
  sources: z.array(z.string().max(80)).max(20),
  approval_note: text(1000).default("")
});
export const toolItemSchema = z.object({
  name: text(200).min(2),
  url: linkOrBlank.default(""),
  scope: text(2000).default(""),
  audience: z.enum(["all", "students", "staff"]),
  activities
});
export const eventItemSchema = eventSuggestionSchema.omit({ referringPage: true }).extend({
  summary: text(1000).default(""),
  activities: activities.default([]),
  demo: z.boolean().optional()
});
export const communityItemSchema = z.object({
  name: text(200).min(2),
  summary: text(2000).default(""),
  url: linkOrBlank.default(""),
  contact: text(200).default(""),
  activities
});
export const trainingItemSchema = z.object({
  title: text(200).min(3),
  summary: text(2000).default(""),
  url: linkOrBlank.default(""),
  format: text(200).default(""),
  tags: z.array(z.enum(["basics", "work", "teach", "study", "tools", "partner"])).max(6)
});
export const contentSchemas = {
  policy: policyItemSchema,
  interpretation: interpretationItemSchema,
  tool: toolItemSchema,
  event: eventItemSchema,
  community: communityItemSchema,
  training: trainingItemSchema
} as const;
export const contentWriteSchema = z.object({ status: contentStatusSchema, data: z.record(z.unknown()) });

export type ContentItem = { id: string; collection: ContentCollection; title: string; status: ContentStatus; origin: "base" | "workspace"; data: Record<string, any> };
export type ContentBundle = Record<ContentCollection, ContentItem[]>;
