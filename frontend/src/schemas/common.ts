import { z } from "zod";

export const apiMetaSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  total: z.number().optional(),
});

export function apiEnvelopeSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    meta: apiMetaSchema.optional(),
  });
}

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiMeta = z.infer<typeof apiMetaSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
