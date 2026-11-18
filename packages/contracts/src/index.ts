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
