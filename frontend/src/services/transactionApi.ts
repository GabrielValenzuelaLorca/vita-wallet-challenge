import { httpClient } from "@/services/httpClient";
import {
  transactionsResponseSchema,
  type TransactionsResponseSchema,
} from "@/schemas/transaction";
import type { TransactionStatus } from "@/types/transaction";

interface GetTransactionsParams {
  page?: number;
  perPage?: number;
  status?: TransactionStatus;
}

export const transactionApi = {
  async getTransactions(
    params: GetTransactionsParams = {},
  ): Promise<TransactionsResponseSchema> {
    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params.perPage !== undefined) {
      queryParams.per_page = String(params.perPage);
    }
    if (params.status !== undefined) {
      queryParams.status = params.status;
    }

    const raw = await httpClient.get<TransactionsResponseSchema>(
      "/transactions",
      { params: queryParams },
    );
    return transactionsResponseSchema.parse(raw);
  },
};
