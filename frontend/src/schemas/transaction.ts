import { z } from "zod";
import { apiEnvelopeSchema, currencySchema } from "./common";
export const transactionStatusSchema = z.enum(["pending", "completed", "rejected"]);
export const transactionKindSchema = z.enum([
  "exchange",
  "deposit",
  "recharge",
  "transfer",
]);

export const transactionSchema = z.object({
  id: z.number(),
  kind: transactionKindSchema,
  source_currency: currencySchema,
  target_currency: currencySchema,
  source_amount: z.string(),
  target_amount: z.string(),
  exchange_rate: z.string(),
  status: transactionStatusSchema,
  rejection_reason: z.string().nullable(),
  created_at: z.string(),
});

export const transactionResponseSchema = apiEnvelopeSchema(transactionSchema);
export const transactionsResponseSchema = apiEnvelopeSchema(
  z.array(transactionSchema),
);

export const exchangeRequestSchema = z.object({
  source_currency: currencySchema,
  target_currency: currencySchema,
  amount: z.string(),
});

export type TransactionStatus = z.infer<typeof transactionStatusSchema>;
export type TransactionKind = z.infer<typeof transactionKindSchema>;
export type TransactionSchema = z.infer<typeof transactionSchema>;
export type TransactionResponseSchema = z.infer<typeof transactionResponseSchema>;
export type TransactionsResponseSchema = z.infer<
  typeof transactionsResponseSchema
>;
export type ExchangeRequest = z.infer<typeof exchangeRequestSchema>;
