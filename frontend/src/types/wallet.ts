export type Currency = "USD" | "CLP" | "BTC" | "USDC" | "USDT";

export interface Wallet {
  id: number;
  currency: Currency;
  balance: string; // String to preserve decimal precision
}
