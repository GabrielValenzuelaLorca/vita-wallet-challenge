import { useQuery } from "@tanstack/react-query";
import { walletApi } from "@/services/walletApi";
import type { WalletSchema } from "@/schemas/wallet";

interface UseBalancesReturn {
  balances: WalletSchema[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useBalances(): UseBalancesReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["balances"],
    queryFn: async () => {
      const response = await walletApi.getBalances();
      return response.data;
    },
  });

  return {
    balances: data ?? [],
    isLoading,
    isError,
    error,
  };
}
