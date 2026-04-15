import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePriceEstimate } from "@/hooks/usePriceEstimate";
import type { PricesResponseSchema } from "@/schemas/price";

type GetPricesFn = () => Promise<PricesResponseSchema>;
const getPricesMock = vi.fn<GetPricesFn>();

vi.mock("@/services/priceApi", () => ({
  priceApi: {
    get getPrices() {
      return getPricesMock;
    },
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

// prices[<crypto>]["<fiat>_sell"] = crypto per 1 fiat.
// 1 USD -> 0.00001538461538 BTC (i.e., 1 BTC ~ 65000 USD)
const pricesResponse: PricesResponseSchema = {
  data: {
    btc: {
      usd_sell: "0.00001538461538",
      usd_buy: "0.00001538461538",
      clp_sell: "0.00000001818181818",
      clp_buy: "0.00000001818181818",
    },
    usdc: {
      usd_sell: "1.0",
      usd_buy: "1.0",
      clp_sell: "0.00094339622641",
      clp_buy: "0.00094339622641",
    },
    usdt: {
      usd_sell: "1.0",
      usd_buy: "1.0",
      clp_sell: "0.00094339622641",
      clp_buy: "0.00094339622641",
    },
  },
};

describe("usePriceEstimate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPricesMock.mockResolvedValue(pricesResponse);
  });

  it("calculates fiat -> crypto (USD -> BTC)", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: "USD",
          targetCurrency: "BTC",
          amount: "650",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.estimate).not.toBeNull());

    const numericEstimate = parseFloat(
      result.current.estimate?.estimatedAmount ?? "0",
    );
    // 650 USD * (1/65000 BTC per USD) = 0.01 BTC
    expect(numericEstimate).toBeCloseTo(0.01, 6);
  });

  it("calculates crypto -> fiat (BTC -> USD)", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: "BTC",
          targetCurrency: "USD",
          amount: "0.01",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.estimate).not.toBeNull());

    const numericEstimate = parseFloat(
      result.current.estimate?.estimatedAmount ?? "0",
    );
    // 0.01 BTC / (1/65000 BTC per USD) = 650 USD
    expect(numericEstimate).toBeCloseTo(650, 2);
  });

  it("returns null when source equals target (same currency)", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: "USD",
          targetCurrency: "USD",
          amount: "100",
        }),
      { wrapper: createWrapper() },
    );

    // Wait for prices to load
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.estimate).toBeNull();
  });

  it("returns null for zero amount", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: "USD",
          targetCurrency: "BTC",
          amount: "0",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.estimate).toBeNull();
  });

  it("returns null when source or target currency is null", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: null,
          targetCurrency: "BTC",
          amount: "100",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.estimate).toBeNull();
  });

  it("calculates crypto -> crypto (BTC -> USDC via USD pivot)", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: "BTC",
          targetCurrency: "USDC",
          amount: "1",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.estimate).not.toBeNull());

    const numericEstimate = parseFloat(
      result.current.estimate?.estimatedAmount ?? "0",
    );
    // 1 BTC / (1/65000) = 65000 USD, then 65000 * 1.0 USDC/USD = 65000 USDC
    expect(numericEstimate).toBeCloseTo(65000, 0);
  });

  it("calculates fiat -> fiat (CLP -> USD via USDC pivot)", async () => {
    const { result } = renderHook(
      () =>
        usePriceEstimate({
          sourceCurrency: "CLP",
          targetCurrency: "USD",
          amount: "1000",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.estimate).not.toBeNull());

    const numericEstimate = parseFloat(
      result.current.estimate?.estimatedAmount ?? "0",
    );
    // 1000 CLP * 0.00094339622641 USDC/CLP = ~0.9434 USDC ≈ 0.9434 USD
    expect(numericEstimate).toBeCloseTo(0.9434, 2);
  });
});
