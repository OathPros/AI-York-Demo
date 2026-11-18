import { z } from "zod";

export const roleSchema = z.enum(["external", "admin"]);
export type DemoRole = z.infer<typeof roleSchema>;

export const eventSuggestionSchema = z.object({
  type: z.literal("event"),
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

export const requestSchema = z.object({
  kind: z.literal("event"),
  payload: eventSuggestionSchema,
  idempotencyKey: z.string().min(16).max(128)
});
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
  status: "published";
};
