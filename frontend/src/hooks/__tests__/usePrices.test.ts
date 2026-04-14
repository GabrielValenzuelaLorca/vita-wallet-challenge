import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePrices } from "@/hooks/usePrices";
import type { PricesResponseSchema } from "@/schemas/price";

const mockGetPrices = vi.fn();

vi.mock("@/services/priceApi", () => ({
  priceApi: {
    get getPrices() {
      return mockGetPrices;
    },
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children });
  };
}

describe("usePrices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns prices object on successful fetch", async () => {
    const mockResponse: PricesResponseSchema = {
      data: {
        btc: {
          usd_sell: "0.00001333333333",
          clp_sell: "0.00000001257862",
        },
        usdc: { usd_sell: "1.0", clp_sell: "0.00094339622641" },
        usdt: { usd_sell: "1.0" },
      },
    };
    mockGetPrices.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.prices).not.toBeNull();
    expect(result.current.prices?.btc.usd_sell).toBe("0.00001333333333");
    expect(result.current.isError).toBe(false);
  });

  it("returns isError true when fetch fails", async () => {
    mockGetPrices.mockRejectedValue(new Error("Service unavailable"));

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.prices).toBeNull();
  });

  it("starts in loading state", () => {
    mockGetPrices.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => usePrices(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.prices).toBeNull();
  });
});
