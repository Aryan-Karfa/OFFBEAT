import { z } from "zod";

export const CreateMemoryEventSchema = z.object({
  eventType: z.enum([
    "TASTE_SELECTED",
    "EXPERIENCE_SELECTED",
    "PLACE_VIEWED",
    "PLACE_EXPLORED",
    "ALTERNATIVE_SELECTED",
    "ITINERARY_CREATED",
    "ITINERARY_STOP_KEPT",
    "ITINERARY_STOP_SWAPPED",
    "TAKE_HOME_VIEWED",
    "TAKE_HOME_SELECTED",
    "CATEGORY_SELECTED",
  ]),
  signalKey: z.string().min(1).max(100),
  signalValue: z.string().min(1).max(200),
  subjectType: z.string().max(50).optional(),
  subjectId: z.string().max(100).optional(),
  weightDelta: z.number().min(-1.0).max(1.0).optional(),
});

export const UpdateMemoryItemSchema = z.object({
  weight: z.number().min(0.05).max(1.0).optional(),
  userVisible: z.boolean().optional(),
});

export const UpdateMemorySettingSchema = z.object({
  memoryEnabled: z.boolean(),
});
