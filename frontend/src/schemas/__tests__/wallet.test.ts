import { describe, it, expect } from "vitest";
import { walletSchema, walletsResponseSchema } from "@/schemas/wallet";

describe("walletSchema", () => {
  it("parses a valid USD wallet", () => {
    const result = walletSchema.parse({ id: 1, currency: "USD", balance: "1000.50" });
    expect(result).toEqual({ id: 1, currency: "USD", balance: "1000.50" });
  });

  it("parses all 5 valid currencies", () => {
    const currencies = ["USD", "CLP", "BTC", "USDC", "USDT"] as const;
    for (const currency of currencies) {
      const result = walletSchema.parse({ id: 1, currency, balance: "100.00" });
      expect(result.currency).toBe(currency);
    }
  });

  it("rejects an invalid currency", () => {
    expect(() =>
      walletSchema.parse({ id: 1, currency: "ETH", balance: "100.00" }),
    ).toThrow();
  });

  it("rejects missing fields", () => {
    expect(() => walletSchema.parse({ id: 1, currency: "USD" })).toThrow();
    expect(() => walletSchema.parse({ currency: "USD", balance: "100" })).toThrow();
    expect(() => walletSchema.parse({ id: 1, balance: "100" })).toThrow();
  });

  it("rejects balance as number instead of string", () => {
    expect(() =>
      walletSchema.parse({ id: 1, currency: "USD", balance: 1000.5 }),
    ).toThrow();
  });
});

describe("walletsResponseSchema", () => {
  it("validates full envelope shape with data array and meta", () => {
    const result = walletsResponseSchema.parse({
      data: [
        { id: 1, currency: "USD", balance: "1000.50" },
        { id: 2, currency: "BTC", balance: "0.05000000" },
      ],
      meta: {},
    });

    expect(result.data).toHaveLength(2);
    expect(result.data[0].currency).toBe("USD");
    expect(result.data[1].currency).toBe("BTC");
  });

  it("validates envelope with no meta", () => {
    const result = walletsResponseSchema.parse({
      data: [{ id: 1, currency: "USDC", balance: "500.00" }],
    });

    expect(result.data).toHaveLength(1);
  });

  it("rejects envelope with invalid wallet in data array", () => {
    expect(() =>
      walletsResponseSchema.parse({
        data: [{ id: 1, currency: "ETH", balance: "100" }],
        meta: {},
      }),
    ).toThrow();
  });
});
