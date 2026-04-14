import type { Currency } from "./wallet";

export type TransactionStatus = "pending" | "completed" | "rejected";

export interface Transaction {
  id: number;
  source_currency: Currency;
  target_currency: Currency;
  source_amount: string;
  target_amount: string;
  exchange_rate: string;
  status: TransactionStatus;
  rejection_reason: string | null;
  created_at: string;
}
