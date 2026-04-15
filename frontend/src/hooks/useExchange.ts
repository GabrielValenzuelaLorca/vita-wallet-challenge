import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { exchangeApi } from "@/services/exchangeApi";
import { useBalances } from "@/hooks/useBalances";
import { ApiRequestError } from "@/services/httpClient";
import type {
  ExchangeRequest,
  TransactionResponseSchema,
  TransactionSchema,
} from "@/schemas/transaction";
import type { WalletSchema } from "@/schemas/wallet";

interface UseExchangeReturn {
  submitExchange: (request: ExchangeRequest) => void;
  reset: () => void;
  result: TransactionSchema | null;
  error: string | null;
  isSubmitting: boolean;
  balances: WalletSchema[];
  isBalancesLoading: boolean;
}

export function useExchange(): UseExchangeReturn {
  const queryClient = useQueryClient();
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

  return useMemo(
    () => ({
      submitExchange,
      reset,
      result,
      error,
      isSubmitting: mutation.isPending,
      balances,
      isBalancesLoading,
    }),
    [
      submitExchange,
      reset,
      result,
      error,
      mutation.isPending,
      balances,
      isBalancesLoading,
    ],
  );
}
