import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useBalances } from "@/hooks/useBalances";
import type { WalletsResponseSchema } from "@/schemas/wallet";

const mockGetBalances = vi.fn();

vi.mock("@/services/walletApi", () => ({
  walletApi: {
    get getBalances() {
      return mockGetBalances;
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

describe("useBalances", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns balances array on successful fetch", async () => {
    const mockResponse: WalletsResponseSchema = {
      data: [
        { id: 1, currency: "USD", balance: "1000.50" },
        { id: 2, currency: "BTC", balance: "0.05000000" },
      ],
    };
    mockGetBalances.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useBalances(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.balances).toHaveLength(2);
    expect(result.current.balances[0].currency).toBe("USD");
    expect(result.current.isError).toBe(false);
  });

  it("returns isError true when fetch fails", async () => {
    mockGetBalances.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useBalances(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.balances).toEqual([]);
  });

  it("starts in loading state", () => {
    mockGetBalances.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useBalances(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.balances).toEqual([]);
  });
});
