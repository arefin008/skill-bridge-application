import { z } from "zod";

export const recommendationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(6).default(4),
});

export const reviewInsightsParamsSchema = z.object({
  id: z.string().trim().min(1, "Tutor ID is required."),
});

export const sentimentPayloadSchema = z.object({
  text: z.string().trim().min(3).max(2000),
});

export const chatHistoryEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(500),
});

export const chatPayloadSchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z.array(chatHistoryEntrySchema).max(10).optional(),
});

export const getValidationMessage = (error: z.ZodError) => {
  return error.issues.map((issue) => issue.message).join(", ");
};
