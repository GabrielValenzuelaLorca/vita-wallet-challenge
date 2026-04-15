import { useMemo } from "react";
import { usePrices } from "@/hooks/usePrices";
import type { Currency } from "@/types/wallet";
import type { PricesData } from "@/schemas/price";

export interface PriceEstimate {
  estimatedAmount: string;
}

interface UsePriceEstimateParams {
  sourceCurrency: Currency | null;
  targetCurrency: Currency | null;
  amount: string;
}

interface UsePriceEstimateReturn {
  estimate: PriceEstimate | null;
  isLoading: boolean;
  error: Error | null;
}

const FIAT_CURRENCIES: readonly Currency[] = ["USD", "CLP"];
const CRYPTO_CURRENCIES: readonly Currency[] = ["BTC", "USDC", "USDT"];

function parseNumeric(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isFiat(currency: Currency): boolean {
  return (FIAT_CURRENCIES as readonly string[]).includes(currency);
}

export function isCrypto(currency: Currency): boolean {
  return (CRYPTO_CURRENCIES as readonly string[]).includes(currency);
}

/**
 * Retrieves the sell rate `prices[<crypto>]["<fiat>_sell"]` using lowercase
 * keys. The value represents "amount of <crypto> per 1 unit of <fiat>".
 */
function getSellRate(
  prices: PricesData,
  crypto: Currency,
  fiat: Currency,
): number | null {
  const cryptoKey = crypto.toLowerCase();
  const fiatKey = fiat.toLowerCase();
  return parseNumeric(prices[cryptoKey]?.[`${fiatKey}_sell`]);
}

export function calculateEstimate(
  prices: PricesData,
  sourceCurrency: Currency,
  targetCurrency: Currency,
  amount: string,
): string | null {
  if (sourceCurrency === targetCurrency) {
    return null;
  }

  const parsedAmount = Number(amount);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return null;
  }

  const sourceIsFiat = isFiat(sourceCurrency);
  const sourceIsCrypto = isCrypto(sourceCurrency);
  const targetIsFiat = isFiat(targetCurrency);
  const targetIsCrypto = isCrypto(targetCurrency);

  // fiat -> crypto: target = amount * (crypto per 1 fiat)
  if (sourceIsFiat && targetIsCrypto) {
    const rate = getSellRate(prices, targetCurrency, sourceCurrency);
    if (rate === null) return null;
    return (parsedAmount * rate).toFixed(8);
  }

  // crypto -> fiat: target = amount / (crypto per 1 fiat)
  if (sourceIsCrypto && targetIsFiat) {
    const rate = getSellRate(prices, sourceCurrency, targetCurrency);
    if (rate === null || rate === 0) return null;
    return (parsedAmount / rate).toFixed(8);
  }

  // crypto -> crypto: pivot via USD
  if (sourceIsCrypto && targetIsCrypto) {
    const sourceCryptoPerUsd = getSellRate(prices, sourceCurrency, "USD");
    const targetCryptoPerUsd = getSellRate(prices, targetCurrency, "USD");
    if (
      sourceCryptoPerUsd === null ||
      targetCryptoPerUsd === null ||
      sourceCryptoPerUsd === 0
    ) {
      return null;
    }
    const sourceInUsd = parsedAmount / sourceCryptoPerUsd;
    return (sourceInUsd * targetCryptoPerUsd).toFixed(8);
  }

  // fiat -> fiat: pivot via USDC (1:1 with USD)
  if (sourceIsFiat && targetIsFiat) {
    const usdcPerSource =
      sourceCurrency === "USD"
        ? 1
        : getSellRate(prices, "USDC", sourceCurrency);
    const usdcPerTarget =
      targetCurrency === "USD"
        ? 1
        : getSellRate(prices, "USDC", targetCurrency);
    if (
      usdcPerSource === null ||
      usdcPerTarget === null ||
      usdcPerTarget === 0
    ) {
      return null;
    }
    const sourceInUsd = parsedAmount * usdcPerSource;
    return (sourceInUsd / usdcPerTarget).toFixed(8);
  }

  return null;
}

export function usePriceEstimate({
  sourceCurrency,
  targetCurrency,
  amount,
}: UsePriceEstimateParams): UsePriceEstimateReturn {
  const { prices, isLoading, error } = usePrices();

  const estimate = useMemo(() => {
    if (!sourceCurrency || !targetCurrency || !prices) {
      return null;
    }

    const estimatedAmount = calculateEstimate(
      prices,
      sourceCurrency,
      targetCurrency,
      amount,
    );

    if (estimatedAmount === null) {
      return null;
    }

    return { estimatedAmount };
  }, [prices, sourceCurrency, targetCurrency, amount]);

  return {
    estimate,
    isLoading,
    error,
  };
}
