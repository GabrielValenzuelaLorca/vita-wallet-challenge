import { describe, it, expect, vi, beforeEach } from "vitest";
import { walletApi } from "@/services/walletApi";
import { httpClient, ApiRequestError } from "@/services/httpClient";
import type { WalletsResponseSchema } from "@/schemas/wallet";

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

describe("walletApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBalances", () => {
    it("calls httpClient.get and returns parsed wallets", async () => {
      const mockResponse: WalletsResponseSchema = {
        data: [
          { id: 1, currency: "USD", balance: "1000.50" },
          { id: 2, currency: "BTC", balance: "0.05000000" },
          { id: 3, currency: "CLP", balance: "500000" },
          { id: 4, currency: "USDC", balance: "500.00" },
          { id: 5, currency: "USDT", balance: "250.00" },
        ],
      };
      mockedGet.mockResolvedValue(mockResponse);

      const result = await walletApi.getBalances();

      expect(mockedGet).toHaveBeenCalledWith("/balances");
      expect(result.data).toHaveLength(5);
      expect(result.data[0].currency).toBe("USD");
      expect(result.data[1].balance).toBe("0.05000000");
    });

    it("throws ZodError when response has malformed data", async () => {
      const malformedResponse = {
        data: [
          { id: 1, currency: "ETH", balance: "100" },
        ],
      };
      mockedGet.mockResolvedValue(malformedResponse);

      await expect(walletApi.getBalances()).rejects.toThrow();
    });

    it("propagates ApiRequestError on 401 unauthorized", async () => {
      mockedGet.mockRejectedValue(
        new ApiRequestError(401, "unauthorized", "Not authenticated"),
      );

      await expect(walletApi.getBalances()).rejects.toThrow("Not authenticated");
    });
  });
});
