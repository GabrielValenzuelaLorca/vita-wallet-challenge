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

function parseNumeric(value: string | undefined): number | null {
  if (value === undefined) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function computeRateToUsd(
  prices: PricesData,
  currency: Currency,
): number | null {
  const direct = parseNumeric(prices[currency]?.USD);
  if (direct !== null) {
    return direct;
  }
  const inverse = parseNumeric(prices.USD?.[currency]);
  if (inverse !== null && inverse > 0) {
    return 1 / inverse;
  }
  return null;
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

      // Direct lookup: is source priced against target?
      const directSourceToTarget = parseNumeric(
        prices[sourceCurrency]?.[targetCurrency],
      );
      if (directSourceToTarget !== null) {
        return (parsedAmount * directSourceToTarget).toFixed(8);
      }

      // Inverse lookup: is target priced against source?
      const inverseTargetToSource = parseNumeric(
        prices[targetCurrency]?.[sourceCurrency],
      );
      if (inverseTargetToSource !== null && inverseTargetToSource > 0) {
        return (parsedAmount / inverseTargetToSource).toFixed(8);
      }

      // Cross-rate via USD
      const sourceToUsd = computeRateToUsd(prices, sourceCurrency);
      const targetToUsd = computeRateToUsd(prices, targetCurrency);
      if (sourceToUsd !== null && targetToUsd !== null && targetToUsd > 0) {
        return ((parsedAmount * sourceToUsd) / targetToUsd).toFixed(8);
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
