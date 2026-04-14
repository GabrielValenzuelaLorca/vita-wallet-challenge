import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransactions } from "@/hooks/useTransactions";
import type {
  TransactionSchema,
  TransactionsResponseSchema,
} from "@/schemas/transaction";
import type { TransactionStatus } from "@/types/transaction";

interface GetTransactionsParams {
  page?: number;
  perPage?: number;
  status?: TransactionStatus;
}

type GetTransactionsFn = (
  params?: GetTransactionsParams,
) => Promise<TransactionsResponseSchema>;

const getTransactionsMock = vi.fn<GetTransactionsFn>();

vi.mock("@/services/transactionApi", () => ({
  transactionApi: {
    get getTransactions() {
      return getTransactionsMock;
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

function makeTransaction(
  id: number,
  status: TransactionStatus = "completed",
): TransactionSchema {
  return {
    id,
    source_currency: "USD",
    target_currency: "BTC",
    source_amount: "10",
    target_amount: "0.0001",
    exchange_rate: "0.00001",
    status,
    rejection_reason: status === "rejected" ? "insufficient_balance" : null,
    created_at: "2026-04-14T10:00:00Z",
  };
}

describe("useTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns transactions and pagination meta on success", async () => {
    getTransactionsMock.mockResolvedValue({
      data: [makeTransaction(1), makeTransaction(2)],
      meta: { page: 1, per_page: 20, total: 2 },
    });

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.page).toBe(1);
    expect(result.current.perPage).toBe(20);
  });

  it("returns empty array and total 0 when there are no transactions", async () => {
    getTransactionsMock.mockResolvedValue({
      data: [],
      meta: { page: 1, per_page: 20, total: 0 },
    });

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transactions).toEqual([]);
    expect(result.current.total).toBe(0);
  });

  it("sets isError when the service throws", async () => {
    getTransactionsMock.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("setPage triggers a refetch with the new page param", async () => {
    getTransactionsMock.mockResolvedValue({
      data: [makeTransaction(1)],
      meta: { page: 1, per_page: 20, total: 1 },
    });

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setPage(3);
    });

    await waitFor(() =>
      expect(getTransactionsMock).toHaveBeenLastCalledWith({
        page: 3,
        perPage: 20,
        status: undefined,
      }),
    );
    expect(result.current.page).toBe(3);
  });

  it("setStatusFilter resets page to 1 and includes the new status", async () => {
    getTransactionsMock.mockResolvedValue({
      data: [],
      meta: { page: 1, per_page: 20, total: 0 },
    });

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setPage(5);
    });
    await waitFor(() => expect(result.current.page).toBe(5));

    act(() => {
      result.current.setStatusFilter("completed");
    });

    await waitFor(() => expect(result.current.page).toBe(1));
    expect(result.current.statusFilter).toBe("completed");
    await waitFor(() =>
      expect(getTransactionsMock).toHaveBeenLastCalledWith({
        page: 1,
        perPage: 20,
        status: "completed",
      }),
    );
  });
});
