import { describe, it, expect } from "vitest";
import {
  priceEntrySchema,
  pricesDataSchema,
  pricesResponseSchema,
} from "@/schemas/price";

describe("priceEntrySchema", () => {
  it("parses valid price entry with string values", () => {
    const result = priceEntrySchema.parse({
      usd_sell: "0.00001333333333",
      clp_sell: "0.00000001257862",
    });
    expect(result).toEqual({
      usd_sell: "0.00001333333333",
      clp_sell: "0.00000001257862",
    });
  });

  it("rejects non-string price values", () => {
    expect(() => priceEntrySchema.parse({ usd_sell: 0.0000133 })).toThrow();
  });
});

describe("pricesDataSchema", () => {
  it("parses valid prices data with multiple cryptos", () => {
    const result = pricesDataSchema.parse({
      btc: {
        usd_sell: "0.00001333333333",
        clp_sell: "0.00000001257862",
      },
      usdc: { usd_sell: "1.0", clp_sell: "0.00094339622641" },
    });
    expect(result.btc.usd_sell).toBe("0.00001333333333");
    expect(result.usdc.clp_sell).toBe("0.00094339622641");
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
        btc: { usd_sell: "0.00001333333333" },
        usdc: { usd_sell: "1.0" },
        usdt: { usd_sell: "1.0" },
      },
      meta: {},
    });

    expect(result.data.btc.usd_sell).toBe("0.00001333333333");
    expect(result.data.usdc.usd_sell).toBe("1.0");
  });

  it("validates envelope with no meta", () => {
    const result = pricesResponseSchema.parse({
      data: { btc: { usd_sell: "0.00001333333333" } },
    });

    expect(result.data.btc.usd_sell).toBe("0.00001333333333");
  });

  it("rejects non-string values inside price entries", () => {
    expect(() =>
      pricesResponseSchema.parse({
        data: { btc: { usd_sell: 0.0000133 } },
        meta: {},
      }),
    ).toThrow();
  });
});
