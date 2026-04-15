import { z } from "zod";
import { apiEnvelopeSchema } from "./common";

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  // Backend includes `created_at` in user responses; the frontend does not
  // currently consume it, but we declare it so the contract is explicit and
  // Zod does not silently strip a field that is part of the API surface.
  created_at: z.string().optional(),
});

export const authResponseSchema = apiEnvelopeSchema(
  z.object({
    token: z.string(),
    user: authUserSchema,
  }),
);

export const meResponseSchema = apiEnvelopeSchema(
  z.object({
    user: authUserSchema,
  }),
);

export type AuthUserSchema = z.infer<typeof authUserSchema>;
export type AuthResponseSchema = z.infer<typeof authResponseSchema>;
export type MeResponseSchema = z.infer<typeof meResponseSchema>;
