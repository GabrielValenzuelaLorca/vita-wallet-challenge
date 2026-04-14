import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { exchangeApi } from "@/services/exchangeApi";
import { useBalances } from "@/hooks/useBalances";
import { usePrices } from "@/hooks/usePrices";
import { ApiRequestError } from "@/services/httpClient";
import type { Currency } from "@/types/wallet";
import type { WalletSchema } from "@/schemas/wallet";
import type {
  ExchangeRequest,
  TransactionResponseSchema,
  TransactionSchema,
} from "@/schemas/transaction";
import type { PricesData } from "@/schemas/price";

interface UseExchangeReturn {
  submitExchange: (request: ExchangeRequest) => void;
  calculateEstimate: (
    sourceCurrency: Currency | null,
    targetCurrency: Currency | null,
    amount: string,
  ) => string | null;
  reset: () => void;
  result: TransactionSchema | null;
  error: string | null;
  isSubmitting: boolean;
  prices: PricesData | null;
  isPricesLoading: boolean;
  balances: WalletSchema[];
  isBalancesLoading: boolean;
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

function isFiat(currency: Currency): boolean {
  return FIAT_CURRENCIES.includes(currency);
}

function isCrypto(currency: Currency): boolean {
  return CRYPTO_CURRENCIES.includes(currency);
}

// Retrieves the sell rate `prices[<crypto>]["<fiat>_sell"]` using lowercase
// keys. The value represents "amount of <crypto> per 1 unit of <fiat>".
function getSellRate(
  prices: PricesData,
  crypto: Currency,
  fiat: Currency,
): number | null {
  const cryptoKey = crypto.toLowerCase();
  const fiatKey = fiat.toLowerCase();
  return parseNumeric(prices[cryptoKey]?.[`${fiatKey}_sell`]);
}

export function useExchange(): UseExchangeReturn {
  const queryClient = useQueryClient();
  const { prices, isLoading: isPricesLoading } = usePrices();
  const { balances, isLoading: isBalancesLoading } = useBalances();

  const [result, setResult] = useState<TransactionSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation<
    TransactionResponseSchema,
    Error,
    ExchangeRequest
  >({
    mutationFn: (request) => exchangeApi.submitExchange(request),
    onSuccess: (response) => {
      setResult(response.data);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err) => {
      setResult(null);
      if (err instanceof ApiRequestError) {
        setError(err.message);
        return;
      }
      setError(err.message);
    },
  });

  const submitExchange = useCallback(
    (request: ExchangeRequest) => {
      setError(null);
      mutation.mutate(request);
    },
    [mutation],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    mutation.reset();
  }, [mutation]);

  const calculateEstimate = useCallback(
    (
      sourceCurrency: Currency | null,
      targetCurrency: Currency | null,
      amount: string,
    ): string | null => {
      if (!sourceCurrency || !targetCurrency) {
        return null;
      }
      if (sourceCurrency === targetCurrency) {
        return null;
      }
      if (!prices) {
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

      // fiat → crypto: target = amount * (crypto per 1 fiat)
      if (sourceIsFiat && targetIsCrypto) {
        const rate = getSellRate(prices, targetCurrency, sourceCurrency);
        if (rate === null) return null;
        return (parsedAmount * rate).toFixed(8);
      }

      // crypto → fiat: target = amount / (crypto per 1 fiat)
      if (sourceIsCrypto && targetIsFiat) {
        const rate = getSellRate(prices, sourceCurrency, targetCurrency);
        if (rate === null || rate === 0) return null;
        return (parsedAmount / rate).toFixed(8);
      }

      // crypto → crypto: pivot via USD
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

      // fiat → fiat: pivot via USDC (1:1 with USD)
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
    },
    [prices],
  );

  return useMemo(
    () => ({
      submitExchange,
      calculateEstimate,
      reset,
      result,
      error,
      isSubmitting: mutation.isPending,
      prices,
      isPricesLoading,
      balances,
      isBalancesLoading,
    }),
    [
      submitExchange,
      calculateEstimate,
      reset,
      result,
      error,
      mutation.isPending,
      prices,
      isPricesLoading,
      balances,
      isBalancesLoading,
    ],
  );
}
