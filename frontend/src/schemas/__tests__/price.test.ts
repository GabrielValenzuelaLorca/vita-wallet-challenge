import { describe, it, expect } from "vitest";
import {
  priceEntrySchema,
  pricesDataSchema,
  pricesResponseSchema,
} from "@/schemas/price";

describe("priceEntrySchema", () => {
  it("parses valid price entry with string values", () => {
    const result = priceEntrySchema.parse({ USD: "67432.50", CLP: "62500000.00" });
    expect(result).toEqual({ USD: "67432.50", CLP: "62500000.00" });
  });

  it("rejects non-string price values", () => {
    expect(() => priceEntrySchema.parse({ USD: 67432.5 })).toThrow();
  });
});

describe("pricesDataSchema", () => {
  it("parses valid prices data with multiple currencies", () => {
    const result = pricesDataSchema.parse({
      BTC: { USD: "67432.50", CLP: "62500000.00" },
      USDC: { USD: "1.00", CLP: "925.00" },
    });
    expect(result.BTC.USD).toBe("67432.50");
    expect(result.USDC.CLP).toBe("925.00");
  });

  it("accepts empty prices object", () => {
    const result = pricesDataSchema.parse({});
    expect(result).toEqual({});
  });
});

describe("pricesResponseSchema", () => {
  it("validates full envelope with price data and meta", () => {
    const result = pricesResponseSchema.parse({
      data: {
        BTC: { USD: "67432.50" },
        USDC: { USD: "1.00" },
        USDT: { USD: "1.00" },
      },
      meta: {},
    });

    expect(result.data.BTC.USD).toBe("67432.50");
    expect(result.data.USDC.USD).toBe("1.00");
  });

  it("validates envelope with no meta", () => {
    const result = pricesResponseSchema.parse({
      data: { BTC: { USD: "67432.50" } },
    });

    expect(result.data.BTC.USD).toBe("67432.50");
  });

  it("rejects non-string values inside price entries", () => {
    expect(() =>
      pricesResponseSchema.parse({
        data: { BTC: { USD: 67432.5 } },
        meta: {},
      }),
    ).toThrow();
  });
});
