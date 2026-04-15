import { z } from "zod";
import { apiEnvelopeSchema, currencySchema } from "./common";

export const walletSchema = z.object({
  id: z.number(),
  currency: currencySchema,
  balance: z.string(),
});

export const walletsResponseSchema = apiEnvelopeSchema(z.array(walletSchema));

export type WalletSchema = z.infer<typeof walletSchema>;
export type WalletsResponseSchema = z.infer<typeof walletsResponseSchema>;
