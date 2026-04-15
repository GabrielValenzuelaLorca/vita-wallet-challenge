import type { Currency } from "@/types/wallet";

const FIAT_CURRENCIES: ReadonlySet<Currency> = new Set(["USD", "CLP"]);
const STABLECOINS: ReadonlySet<Currency> = new Set(["USDC", "USDT"]);

export function formatCurrency(
  amount: string | number,
  currency: Currency,
): string {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  if (!Number.isFinite(numericAmount)) {
    return `0 ${currency}`;
  }

  if (FIAT_CURRENCIES.has(currency)) {
    return formatFiat(numericAmount, currency);
  }

  if (STABLECOINS.has(currency)) {
    return formatStablecoin(numericAmount, currency);
  }

  return formatVolatileCrypto(numericAmount, currency);
}

function formatFiat(amount: number, currency: Currency): string {
  const fractionDigits = currency === "CLP" ? 0 : 2;

  return amount.toLocaleString("es-CL", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

function formatStablecoin(amount: number, currency: Currency): string {
  const formatted = amount.toLocaleString("es-CL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

function formatVolatileCrypto(amount: number, currency: Currency): string {
  const formatted = amount.toLocaleString("es-CL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
  return `${formatted} ${currency}`;
}
