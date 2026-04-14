import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { transactionApi } from "@/services/transactionApi";
import type {
  TransactionSchema,
  TransactionsResponseSchema,
} from "@/schemas/transaction";
import type { TransactionStatus } from "@/types/transaction";

interface UseTransactionsOptions {
  initialPage?: number;
  initialPerPage?: number;
}

interface UseTransactionsReturn {
  transactions: TransactionSchema[];
  page: number;
  perPage: number;
  total: number;
  statusFilter: TransactionStatus | undefined;
  setPage: (page: number) => void;
  setStatusFilter: (status: TransactionStatus | undefined) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export function useTransactions(
  options: UseTransactionsOptions = {},
): UseTransactionsReturn {
  const [page, setPageState] = useState<number>(options.initialPage ?? 1);
  const [perPage] = useState<number>(options.initialPerPage ?? 20);
  const [statusFilter, setStatusFilterState] = useState<
    TransactionStatus | undefined
  >(undefined);

  const query = useQuery<TransactionsResponseSchema, Error>({
    queryKey: ["transactions", page, perPage, statusFilter],
    queryFn: () =>
      transactionApi.getTransactions({
        page,
        perPage,
        status: statusFilter,
      }),
  });

  const setPage = useCallback((nextPage: number) => {
    setPageState(nextPage);
  }, []);

  const setStatusFilter = useCallback(
    (status: TransactionStatus | undefined) => {
      setStatusFilterState(status);
      setPageState(1);
    },
    [],
  );

  return {
    transactions: query.data?.data ?? [],
    page,
    perPage,
    total: query.data?.meta?.total ?? 0,
    statusFilter,
    setPage,
    setStatusFilter,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ?? null,
  };
}
