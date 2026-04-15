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
      return numericAmount.toLocaleString("es-CL", {
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
      const formatted = numericAmount.toLocaleString("es-CL", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
      });
      return `${formatted} BTC`;
    }
    case "USDC":
    case "USDT":
      return `${numericAmount.toLocaleString("es-CL", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currency}`;
  }
}
