import { describe, it, expect } from "vitest";
import {
  transactionSchema,
  transactionResponseSchema,
  transactionsResponseSchema,
  exchangeRequestSchema,
} from "@/schemas/transaction";

const validTransaction = {
  id: 1,
  kind: "exchange",
  source_currency: "USD",
  target_currency: "BTC",
  source_amount: "100.00000000",
  target_amount: "0.00148234",
  exchange_rate: "0.00001482",
  status: "completed",
  rejection_reason: null,
  created_at: "2026-04-14T10:00:00Z",
};

describe("transactionSchema", () => {
  it("parses a valid transaction", () => {
    const parsed = transactionSchema.parse(validTransaction);
    expect(parsed.id).toBe(1);
    expect(parsed.status).toBe("completed");
  });

  it("accepts null rejection_reason", () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, rejection_reason: null }),
    ).not.toThrow();
  });

  it("accepts a string rejection_reason", () => {
    expect(() =>
      transactionSchema.parse({
        ...validTransaction,
        status: "rejected",
        rejection_reason: "insufficient_balance",
      }),
    ).not.toThrow();
  });

  it("rejects an invalid status", () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, status: "unknown" }),
    ).toThrow();
  });

  it("rejects an invalid source currency", () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, source_currency: "EUR" }),
    ).toThrow();
  });

  it("rejects an invalid target currency", () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, target_currency: "EUR" }),
    ).toThrow();
  });

  it("requires numeric id", () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, id: "not-a-number" }),
    ).toThrow();
  });

  it("requires string amounts", () => {
    expect(() =>
      transactionSchema.parse({ ...validTransaction, source_amount: 100 }),
    ).toThrow();
  });
});

describe("transactionResponseSchema", () => {
  it("validates the success envelope", () => {
    const envelope = { data: validTransaction };
    expect(() => transactionResponseSchema.parse(envelope)).not.toThrow();
  });

  it("rejects envelope with invalid transaction inside", () => {
    expect(() =>
      transactionResponseSchema.parse({
        data: { ...validTransaction, status: "bogus" },
      }),
    ).toThrow();
  });
});

describe("transactionsResponseSchema", () => {
  it("validates an empty list envelope", () => {
    expect(() =>
      transactionsResponseSchema.parse({
        data: [],
        meta: { page: 1, per_page: 20, total: 0 },
      }),
    ).not.toThrow();
  });

  it("validates a list envelope with one transaction", () => {
    const envelope = {
      data: [validTransaction],
      meta: { page: 1, per_page: 20, total: 1 },
    };
    expect(() => transactionsResponseSchema.parse(envelope)).not.toThrow();
  });

  it("rejects list envelope with malformed transaction", () => {
    expect(() =>
      transactionsResponseSchema.parse({
        data: [{ ...validTransaction, id: "bogus" }],
      }),
    ).toThrow();
  });
});

describe("exchangeRequestSchema", () => {
  it("validates a well-formed exchange request", () => {
    expect(() =>
      exchangeRequestSchema.parse({
        source_currency: "USD",
        target_currency: "BTC",
        amount: "10",
      }),
    ).not.toThrow();
  });

  it("rejects an invalid source currency", () => {
    expect(() =>
      exchangeRequestSchema.parse({
        source_currency: "EUR",
        target_currency: "BTC",
        amount: "10",
      }),
    ).toThrow();
  });

  it("rejects a non-string amount", () => {
    expect(() =>
      exchangeRequestSchema.parse({
        source_currency: "USD",
        target_currency: "BTC",
        amount: 10,
      }),
    ).toThrow();
  });
});
