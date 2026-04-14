import { useQuery } from "@tanstack/react-query";
import { priceApi } from "@/services/priceApi";
import type { PricesData } from "@/schemas/price";

interface UsePricesReturn {
  prices: PricesData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function usePrices(): UsePricesReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["prices"],
    queryFn: async () => {
      const response = await priceApi.getPrices();
      return response.data;
    },
    refetchInterval: 30_000,
  });

  return {
    prices: data ?? null,
    isLoading,
    isError,
    error,
  };
}
