import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useExchange } from "@/hooks/useExchange";
import { ApiRequestError } from "@/services/httpClient";
import type {
  TransactionResponseSchema,
  ExchangeRequest,
} from "@/schemas/transaction";
import type { WalletsResponseSchema } from "@/schemas/wallet";

type SubmitExchangeFn = (
  request: ExchangeRequest,
) => Promise<TransactionResponseSchema>;
type GetBalancesFn = () => Promise<WalletsResponseSchema>;

const submitExchangeMock = vi.fn<SubmitExchangeFn>();
const getBalancesMock = vi.fn<GetBalancesFn>();

vi.mock("@/services/exchangeApi", () => ({
  exchangeApi: {
    get submitExchange() {
      return submitExchangeMock;
    },
  },
}));

vi.mock("@/services/walletApi", () => ({
  walletApi: {
    get getBalances() {
      return getBalancesMock;
    },
  },
}));

vi.mock("@/services/httpClient", () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  ApiRequestError: class ApiRequestError extends Error {
    statusCode: number;
    errorCode: string;
    constructor(statusCode: number, errorCode: string, message: string) {
      super(message);
      this.name = "ApiRequestError";
      this.statusCode = statusCode;
      this.errorCode = errorCode;
    }
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

const balancesResponse: WalletsResponseSchema = {
  data: [
    { id: 1, currency: "USD", balance: "1000.00000000" },
    { id: 2, currency: "BTC", balance: "0.05000000" },
  ],
};

const successTransaction: TransactionResponseSchema = {
  data: {
    id: 7,
    kind: "exchange",
    source_currency: "USD",
    target_currency: "BTC",
    source_amount: "10",
    target_amount: "0.00015384",
    exchange_rate: "65000",
    status: "completed",
    rejection_reason: null,
    created_at: "2026-04-14T10:00:00Z",
  },
};

describe("useExchange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBalancesMock.mockResolvedValue(balancesResponse);
  });

  it("sets result on successful submitExchange", async () => {
    submitExchangeMock.mockResolvedValueOnce(successTransaction);
    const { result } = renderHook(() => useExchange(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.submitExchange({
        source_currency: "USD",
        target_currency: "BTC",
        amount: "10",
      });
    });

    await waitFor(() => expect(result.current.result).not.toBeNull());
    expect(result.current.result?.id).toBe(7);
    expect(result.current.error).toBeNull();
  });

  it("sets error message on ApiRequestError rejection", async () => {
    submitExchangeMock.mockRejectedValueOnce(
      new ApiRequestError(422, "insufficient_balance", "Not enough USD"),
    );
    const { result } = renderHook(() => useExchange(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.submitExchange({
        source_currency: "USD",
        target_currency: "BTC",
        amount: "9999",
      });
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toBe("Not enough USD");
    expect(result.current.result).toBeNull();
  });

  it("reset clears result and error", async () => {
    submitExchangeMock.mockResolvedValueOnce(successTransaction);
    const { result } = renderHook(() => useExchange(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.submitExchange({
        source_currency: "USD",
        target_currency: "BTC",
        amount: "10",
      });
    });
    await waitFor(() => expect(result.current.result).not.toBeNull());

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
