import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, userEvent } from "@/test/testUtils";
import { HistoryPage } from "@/pages/History/HistoryPage";
import type {
  TransactionsResponseSchema,
  TransactionSchema,
} from "@/schemas/transaction";
import type { TransactionStatus } from "@/types/transaction";
import { ApiRequestError } from "@/services/httpClient";

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

const completedTransaction: TransactionSchema = {
  id: 1,
  kind: "exchange",
  source_currency: "USD",
  target_currency: "BTC",
  source_amount: "100.00",
  target_amount: "0.00148",
  exchange_rate: "0.0000148",
  status: "completed",
  rejection_reason: null,
  created_at: "2026-04-14T10:00:00Z",
};

const rejectedTransaction: TransactionSchema = {
  id: 2,
  kind: "exchange",
  source_currency: "BTC",
  target_currency: "USD",
  source_amount: "0.01",
  target_amount: "0",
  exchange_rate: "65000",
  status: "rejected",
  rejection_reason: "insufficient_balance",
  created_at: "2026-04-13T09:00:00Z",
};

const sampleData: TransactionsResponseSchema = {
  data: [completedTransaction, rejectedTransaction],
  meta: { page: 1, per_page: 20, total: 2 },
};

describe("HistoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the History title in Spanish", async () => {
    getTransactionsMock.mockResolvedValue(sampleData);
    render(<HistoryPage />);
    expect(
      await screen.findByRole("heading", {
        name: /historial de transacciones/i,
        level: 2,
      }),
    ).toBeInTheDocument();
  });

  it("renders status tags for completed and rejected transactions", async () => {
    getTransactionsMock.mockResolvedValue(sampleData);
    render(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText("Completada")).toBeInTheDocument();
      expect(screen.getByText("Rechazada")).toBeInTheDocument();
    });
  });

  it("shows the rejection reason for rejected rows", async () => {
    getTransactionsMock.mockResolvedValue(sampleData);
    render(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText(/insufficient_balance/i)).toBeInTheDocument();
    });
  });

  it("shows the status filter and refetches when a status is selected", async () => {
    getTransactionsMock.mockResolvedValue(sampleData);
    const user = userEvent.setup();
    render(<HistoryPage />);
    await waitFor(() => expect(getTransactionsMock).toHaveBeenCalled());

    const filter = screen.getByRole("combobox");
    await user.click(filter);
    const option = await screen.findByText("Completadas");
    await user.click(option);

    await waitFor(() =>
      expect(getTransactionsMock).toHaveBeenLastCalledWith({
        page: 1,
        perPage: 20,
        status: "completed",
      }),
    );
  });

  it("shows the total count in the pagination footer", async () => {
    getTransactionsMock.mockResolvedValue(sampleData);
    render(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getByText(/Total: 2 transacciones/i)).toBeInTheDocument();
    });
  });

  it("shows an error alert when the request fails", async () => {
    getTransactionsMock.mockRejectedValue(
      new ApiRequestError(500, "server_error", "Something broke"),
    );
    render(<HistoryPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/error al cargar las transacciones/i),
      ).toBeInTheDocument();
    });
  });

  it("shows empty state when there are no transactions", async () => {
    getTransactionsMock.mockResolvedValue({
      data: [],
      meta: { page: 1, per_page: 20, total: 0 },
    });
    render(<HistoryPage />);
    await waitFor(() => {
      expect(screen.getAllByText(/no data/i).length).toBeGreaterThan(0);
    });
  });
});
