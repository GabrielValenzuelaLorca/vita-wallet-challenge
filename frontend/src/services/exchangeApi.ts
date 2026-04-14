import { httpClient } from "@/services/httpClient";
import {
  exchangeRequestSchema,
  transactionResponseSchema,
  type ExchangeRequest,
  type TransactionResponseSchema,
} from "@/schemas/transaction";

export const exchangeApi = {
  async submitExchange(
    request: ExchangeRequest,
  ): Promise<TransactionResponseSchema> {
    const payload = exchangeRequestSchema.parse(request);
    const raw = await httpClient.post<TransactionResponseSchema>("/exchange", {
      body: {
        source_currency: payload.source_currency,
        target_currency: payload.target_currency,
        amount: payload.amount,
      },
    });
    return transactionResponseSchema.parse(raw);
  },
};
