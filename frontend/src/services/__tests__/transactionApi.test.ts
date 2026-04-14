import { describe, it, expect, vi, beforeEach } from "vitest";
import { transactionApi } from "@/services/transactionApi";
import { httpClient, ApiRequestError } from "@/services/httpClient";
import type { TransactionsResponseSchema } from "@/schemas/transaction";

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

const mockedGet = vi.mocked(httpClient.get);

const validResponse: TransactionsResponseSchema = {
  data: [
    {
      id: 1,
      source_currency: "USD",
      target_currency: "BTC",
      source_amount: "10",
      target_amount: "0.0001",
      exchange_rate: "0.00001",
      status: "completed",
      rejection_reason: null,
      created_at: "2026-04-14T10:00:00Z",
    },
  ],
  meta: { page: 1, per_page: 20, total: 1 },
};

describe("transactionApi.getTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed envelope on success", async () => {
    mockedGet.mockResolvedValue(validResponse);

    const result = await transactionApi.getTransactions();

    expect(result.data).toHaveLength(1);
    expect(result.meta?.total).toBe(1);
  });

  it("passes page, per_page, and status as query params in snake_case", async () => {
    mockedGet.mockResolvedValue({
      data: [],
      meta: { page: 2, per_page: 10, total: 0 },
    });

    await transactionApi.getTransactions({
      page: 2,
      perPage: 10,
      status: "completed",
    });

    expect(mockedGet).toHaveBeenCalledWith("/transactions", {
      params: { page: "2", per_page: "10", status: "completed" },
    });
  });

  it("omits undefined params from the query", async () => {
    mockedGet.mockResolvedValue({
      data: [],
      meta: { page: 1, per_page: 20, total: 0 },
    });

    await transactionApi.getTransactions({});

    expect(mockedGet).toHaveBeenCalledWith("/transactions", { params: {} });
  });

  it("throws when response does not match schema", async () => {
    mockedGet.mockResolvedValue({ data: [{ id: "bogus" }] });

    await expect(transactionApi.getTransactions()).rejects.toThrow();
  });

  it("propagates ApiRequestError on 401 unauthorized", async () => {
    mockedGet.mockRejectedValue(
      new ApiRequestError(401, "unauthorized", "Invalid token"),
    );

    await expect(transactionApi.getTransactions()).rejects.toThrow(
      "Invalid token",
    );
  });
});
