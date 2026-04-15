import type { Currency } from "@/types/wallet";

export function formatCurrency(
  amount: string | number,
  currency: Currency,
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (!Number.isFinite(numericAmount)) {
    return `0 ${currency}`;
  }

  switch (currency) {
    case "USD":
      return numericAmount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "CLP":
      return numericAmount.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      });
    case "BTC": {
      const formatted = numericAmount
        .toFixed(8)
        .replace(/0+$/, "")
        .replace(/\.$/, "");
      return `${formatted || "0"} BTC`;
    }
    case "USDC":
    case "USDT":
      return `${numericAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currency}`;
  }
}
