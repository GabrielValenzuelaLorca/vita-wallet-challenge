import { describe, it, expect, vi, beforeEach } from "vitest";
import { exchangeApi } from "@/services/exchangeApi";
import { httpClient, ApiRequestError } from "@/services/httpClient";
import type { TransactionResponseSchema } from "@/schemas/transaction";

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

const mockedPost = vi.mocked(httpClient.post);

const validResponse: TransactionResponseSchema = {
  data: {
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
};

describe("exchangeApi.submitExchange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls POST /exchange with body and returns parsed response", async () => {
    mockedPost.mockResolvedValue(validResponse);

    const result = await exchangeApi.submitExchange({
      source_currency: "USD",
      target_currency: "BTC",
      amount: "10",
    });

    expect(mockedPost).toHaveBeenCalledWith("/exchange", {
      body: { source_currency: "USD", target_currency: "BTC", amount: "10" },
    });
    expect(result.data.status).toBe("completed");
    expect(result.data.id).toBe(1);
  });

  it("throws when response does not match schema", async () => {
    mockedPost.mockResolvedValue({ data: { id: "not-numeric" } });

    await expect(
      exchangeApi.submitExchange({
        source_currency: "USD",
        target_currency: "BTC",
        amount: "10",
      }),
    ).rejects.toThrow();
  });

  it("propagates ApiRequestError on 422 insufficient_balance", async () => {
    mockedPost.mockRejectedValue(
      new ApiRequestError(422, "insufficient_balance", "Not enough USD"),
    );

    await expect(
      exchangeApi.submitExchange({
        source_currency: "USD",
        target_currency: "BTC",
        amount: "9999",
      }),
    ).rejects.toThrow("Not enough USD");
  });

  it("rejects a request with invalid currency before hitting the network", async () => {
    interface UntypedRequest {
      source_currency: string;
      target_currency: string;
      amount: string;
    }
    const untypedRequest: UntypedRequest = {
      source_currency: "EUR",
      target_currency: "BTC",
      amount: "10",
    };
    const submit = exchangeApi.submitExchange as (
      request: UntypedRequest,
    ) => Promise<TransactionResponseSchema>;

    await expect(submit(untypedRequest)).rejects.toThrow();
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
