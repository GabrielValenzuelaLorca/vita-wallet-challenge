import { describe, it, expect } from "vitest";
import { apiEnvelopeSchema, apiErrorSchema, apiMetaSchema } from "@/schemas/common";
import { z } from "zod";

describe("apiEnvelopeSchema", () => {
  it("parses a valid envelope with data", () => {
    const schema = apiEnvelopeSchema(z.object({ id: z.number() }));
    const result = schema.parse({ data: { id: 1 } });
    expect(result.data.id).toBe(1);
  });

  it("parses a valid envelope with data and meta", () => {
    const schema = apiEnvelopeSchema(z.object({ id: z.number() }));
    const result = schema.parse({
      data: { id: 1 },
      meta: { page: 1, per_page: 20, total: 100 },
    });
    expect(result.meta?.page).toBe(1);
  });

  it("rejects missing data field", () => {
    const schema = apiEnvelopeSchema(z.object({ id: z.number() }));
    expect(() => schema.parse({ meta: {} })).toThrow();
  });
});

describe("apiErrorSchema", () => {
  it("parses a valid error response", () => {
    const result = apiErrorSchema.parse({
      error: { code: "not_found", message: "Resource not found" },
    });
    expect(result.error.code).toBe("not_found");
  });

  it("rejects missing error code", () => {
    expect(() =>
      apiErrorSchema.parse({ error: { message: "No code" } }),
    ).toThrow();
  });
});

describe("apiMetaSchema", () => {
  it("parses valid pagination meta", () => {
    const result = apiMetaSchema.parse({ page: 2, per_page: 10, total: 50 });
    expect(result.page).toBe(2);
  });

  it("allows empty meta object", () => {
    const result = apiMetaSchema.parse({});
    expect(result.page).toBeUndefined();
  });
});
