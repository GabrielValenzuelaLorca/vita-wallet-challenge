import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/utils/formatCurrency";

describe("formatCurrency", () => {
  describe("USD (fiat)", () => {
    it("formats a typical amount with 2 decimals and $ symbol", () => {
      const result = formatCurrency(1234.56, "USD");
      expect(result).toContain("1.234,56");
      expect(result).toMatch(/US\$|USD|\$/);
    });

    it("formats zero", () => {
      const result = formatCurrency(0, "USD");
      expect(result).toContain("0,00");
    });

    it("formats large values with thousands separator", () => {
      const result = formatCurrency(1000000, "USD");
      expect(result).toContain("1.000.000");
    });

    it("formats negative values", () => {
      const result = formatCurrency(-50.5, "USD");
      expect(result).toContain("50,50");
    });

    it("accepts string amounts", () => {
      const result = formatCurrency("999.99", "USD");
      expect(result).toContain("999,99");
    });
  });

  describe("CLP (fiat)", () => {
    it("formats without decimals", () => {
      const result = formatCurrency(50000, "CLP");
      expect(result).toContain("50.000");
      expect(result).not.toContain(",");
    });

    it("formats zero", () => {
      const result = formatCurrency(0, "CLP");
      expect(result).toMatch(/\$\s*0|0\s*CLP/);
    });

    it("formats large values", () => {
      const result = formatCurrency(1500000, "CLP");
      expect(result).toContain("1.500.000");
    });
  });

  describe("BTC (crypto)", () => {
    it("formats with up to 8 decimal places and BTC suffix", () => {
      const result = formatCurrency(0.00015384, "BTC");
      expect(result).toContain("BTC");
      expect(result).toContain("0,00015384");
    });

    it("trims trailing zeros", () => {
      const result = formatCurrency("1.50000000", "BTC");
      expect(result).toContain("BTC");
      expect(result).toMatch(/1,5\s+BTC/);
    });

    it("formats zero", () => {
      const result = formatCurrency(0, "BTC");
      expect(result).toBe("0 BTC");
    });

    it("formats a whole number", () => {
      const result = formatCurrency(1, "BTC");
      expect(result).toBe("1 BTC");
    });
  });

  describe("USDC (stablecoin)", () => {
    it("formats with 2 decimals and USDC suffix", () => {
      const result = formatCurrency(500.25, "USDC");
      expect(result).toContain("500,25");
      expect(result).toContain("USDC");
    });

    it("formats zero with 2 decimals", () => {
      const result = formatCurrency(0, "USDC");
      expect(result).toBe("0,00 USDC");
    });
  });

  describe("USDT (stablecoin)", () => {
    it("formats with 2 decimals and USDT suffix", () => {
      const result = formatCurrency(1000.5, "USDT");
      expect(result).toBe("1.000,50 USDT");
    });

    it("formats zero with 2 decimals", () => {
      const result = formatCurrency(0, "USDT");
      expect(result).toBe("0,00 USDT");
    });
  });

  describe("edge cases", () => {
    it("returns '0 <currency>' for NaN string input", () => {
      expect(formatCurrency("abc", "USD")).toBe("0 USD");
      expect(formatCurrency("abc", "BTC")).toBe("0 BTC");
    });

    it("returns '0 <currency>' for empty string", () => {
      expect(formatCurrency("", "CLP")).toBe("0 CLP");
    });

    it("handles very large crypto amounts", () => {
      const result = formatCurrency(21000000, "BTC");
      expect(result).toContain("21.000.000");
      expect(result).toContain("BTC");
    });

    it("handles very small crypto amounts", () => {
      const result = formatCurrency(0.00000001, "BTC");
      expect(result).toContain("0,00000001");
      expect(result).toContain("BTC");
    });

    it("handles negative crypto amounts", () => {
      const result = formatCurrency(-0.5, "BTC");
      expect(result).toContain("0,5");
      expect(result).toContain("BTC");
    });
  });
});
