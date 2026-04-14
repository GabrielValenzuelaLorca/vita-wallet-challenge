import { z } from "zod";
import { apiEnvelopeSchema } from "./common";

const currencySchema = z.enum(["USD", "CLP", "BTC", "USDC", "USDT"]);

export const walletSchema = z.object({
  id: z.number(),
  currency: currencySchema,
  balance: z.string(),
});

export const walletsResponseSchema = apiEnvelopeSchema(z.array(walletSchema));

export type WalletSchema = z.infer<typeof walletSchema>;
export type WalletsResponseSchema = z.infer<typeof walletsResponseSchema>;
