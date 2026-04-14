import { z } from "zod";
import { apiEnvelopeSchema } from "./common";

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
});

export const authResponseSchema = apiEnvelopeSchema(
  z.object({
    token: z.string(),
    user: authUserSchema,
  }),
);

export type AuthUserSchema = z.infer<typeof authUserSchema>;
export type AuthResponseSchema = z.infer<typeof authResponseSchema>;
