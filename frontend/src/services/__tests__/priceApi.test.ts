import { describe, it, expect, vi, beforeEach } from "vitest";
import { priceApi } from "@/services/priceApi";
import { httpClient, ApiRequestError } from "@/services/httpClient";
import type { PricesResponseSchema } from "@/schemas/price";

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

describe("priceApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPrices", () => {
    it("calls httpClient.get and returns parsed prices", async () => {
      const mockResponse: PricesResponseSchema = {
        data: {
          BTC: { USD: "67432.50", CLP: "62500000.00" },
          USDC: { USD: "1.00", CLP: "925.00" },
          USDT: { USD: "1.00", CLP: "925.00" },
        },
      };
      mockedGet.mockResolvedValue(mockResponse);

      const result = await priceApi.getPrices();

      expect(mockedGet).toHaveBeenCalledWith("/prices");
      expect(result.data.BTC.USD).toBe("67432.50");
      expect(result.data.USDC.CLP).toBe("925.00");
    });

    it("propagates ApiRequestError on 503 service unavailable", async () => {
      mockedGet.mockRejectedValue(
        new ApiRequestError(503, "service_unavailable", "Price service unavailable"),
      );

      await expect(priceApi.getPrices()).rejects.toThrow("Price service unavailable");
    });
  });
});
