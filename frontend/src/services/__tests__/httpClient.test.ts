import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient, ApiRequestError } from "../httpClient";

interface TestResponse {
  data: { id: number; name: string };
  meta: Record<string, string>;
}

const TOKEN_KEY = "auth_token";

function mockFetch(response: Response): void {
  globalThis.fetch = vi.fn().mockResolvedValue(response) as typeof fetch;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("httpClient", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("GET requests", () => {
    it("performs a GET request and returns typed data", async () => {
      const expected: TestResponse = {
        data: { id: 1, name: "Alice" },
        meta: {},
      };
      mockFetch(jsonResponse(expected));

      const result = await httpClient.get<TestResponse>("/users/1");

      expect(result).toEqual(expected);
      expect(globalThis.fetch).toHaveBeenCalledOnce();
    });

    it("includes query params in the URL", async () => {
      mockFetch(jsonResponse({ data: [], meta: {} }));

      await httpClient.get("/transactions", {
        params: { page: "1", per_page: "20", status: "completed" },
      });

      const calledUrl = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[0];
      expect(calledUrl).toContain("page=1");
      expect(calledUrl).toContain("per_page=20");
      expect(calledUrl).toContain("status=completed");
    });

    it("includes auth token from localStorage when present", async () => {
      localStorage.setItem(TOKEN_KEY, "test-jwt-token");
      mockFetch(jsonResponse({ data: {}, meta: {} }));

      await httpClient.get("/auth/me");

      const calledOptions = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[1];
      const headers = calledOptions.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer test-jwt-token");
    });

    it("omits auth header when no token stored", async () => {
      mockFetch(jsonResponse({ data: {}, meta: {} }));

      await httpClient.get("/public");

      const calledOptions = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[1];
      const headers = calledOptions.headers as Record<string, string>;
      expect(headers["Authorization"]).toBeUndefined();
    });
  });

  describe("POST requests", () => {
    it("sends a JSON body for POST", async () => {
      mockFetch(jsonResponse({ data: { id: 1 }, meta: {} }));

      await httpClient.post("/auth/login", {
        body: { email: "demo@test.com", password: "secret" },
      });

      const calledOptions = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[1];
      expect(calledOptions.method).toBe("POST");
      expect(calledOptions.body).toBe(
        JSON.stringify({ email: "demo@test.com", password: "secret" }),
      );
    });

    it("works with no body", async () => {
      mockFetch(jsonResponse({ data: {}, meta: {} }));

      await httpClient.post("/auth/logout");

      const calledOptions = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[1];
      expect(calledOptions.body).toBeUndefined();
    });
  });

  describe("PUT and DELETE requests", () => {
    it("sends PUT with body", async () => {
      mockFetch(jsonResponse({ data: {}, meta: {} }));

      await httpClient.put("/resource/1", { body: { name: "updated" } });

      const calledOptions = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[1];
      expect(calledOptions.method).toBe("PUT");
      expect(calledOptions.body).toBe(JSON.stringify({ name: "updated" }));
    });

    it("sends DELETE", async () => {
      mockFetch(jsonResponse({ data: {}, meta: {} }));

      await httpClient.delete("/resource/1");

      const calledOptions = (
        (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
          string,
          RequestInit,
        ]
      )[1];
      expect(calledOptions.method).toBe("DELETE");
    });
  });

  describe("error handling", () => {
    it("throws ApiRequestError with code and message from error envelope", async () => {
      const errorBody = {
        error: {
          code: "insufficient_balance",
          message: "Not enough funds",
        },
      };
      mockFetch(jsonResponse(errorBody, 422));

      await expect(httpClient.post("/exchange")).rejects.toThrowError(
        ApiRequestError,
      );
    });

    it("populates statusCode, errorCode, and message on the error", async () => {
      mockFetch(
        jsonResponse(
          {
            error: { code: "unauthorized", message: "Token expired" },
          },
          401,
        ),
      );

      try {
        await httpClient.get("/auth/me");
        expect.fail("Expected request to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiRequestError);
        const apiError = error as ApiRequestError;
        expect(apiError.statusCode).toBe(401);
        expect(apiError.errorCode).toBe("unauthorized");
        expect(apiError.message).toBe("Token expired");
      }
    });

    it("falls back to defaults when error response is not JSON", async () => {
      const nonJsonResponse = new Response("Not Found", { status: 404 });
      mockFetch(nonJsonResponse);

      try {
        await httpClient.get("/missing");
        expect.fail("Expected request to throw");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiRequestError);
        const apiError = error as ApiRequestError;
        expect(apiError.statusCode).toBe(404);
        expect(apiError.errorCode).toBe("UNKNOWN_ERROR");
        expect(apiError.message).toContain("404");
      }
    });

    it("falls back to defaults when error envelope is missing fields", async () => {
      mockFetch(jsonResponse({}, 500));

      try {
        await httpClient.get("/broken");
        expect.fail("Expected request to throw");
      } catch (error) {
        const apiError = error as ApiRequestError;
        expect(apiError.statusCode).toBe(500);
        expect(apiError.errorCode).toBe("UNKNOWN_ERROR");
      }
    });
  });

  describe("401 unauthorized handling", () => {
    it("dispatches auth:unauthorized and clears token for non-auth 401", async () => {
      localStorage.setItem(TOKEN_KEY, "stale-token");
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      mockFetch(
        jsonResponse(
          { error: { code: "unauthorized", message: "Token expired" } },
          401,
        ),
      );

      await expect(httpClient.get("/balances")).rejects.toThrow(
        ApiRequestError,
      );

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: "auth:unauthorized" }),
      );
    });

    it("does NOT dispatch auth:unauthorized for /auth/ paths", async () => {
      localStorage.setItem(TOKEN_KEY, "some-token");
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      mockFetch(
        jsonResponse(
          { error: { code: "invalid_credentials", message: "Bad password" } },
          401,
        ),
      );

      await expect(
        httpClient.post("/auth/login", {
          body: { email: "x@x.com", password: "wrong" },
        }),
      ).rejects.toThrow(ApiRequestError);

      // Token should still be present (not cleared)
      expect(localStorage.getItem(TOKEN_KEY)).toBe("some-token");
      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "auth:unauthorized" }),
      );
    });

    it("does NOT dispatch auth:unauthorized for non-401 errors", async () => {
      const dispatchSpy = vi.spyOn(window, "dispatchEvent");
      mockFetch(
        jsonResponse(
          { error: { code: "server_error", message: "Crash" } },
          500,
        ),
      );

      await expect(httpClient.get("/broken")).rejects.toThrow(ApiRequestError);

      expect(dispatchSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: "auth:unauthorized" }),
      );
    });
  });

  describe("ApiRequestError class", () => {
    it("has the correct name", () => {
      const error = new ApiRequestError(400, "BAD_REQUEST", "Invalid");
      expect(error.name).toBe("ApiRequestError");
    });

    it("is an instance of Error", () => {
      const error = new ApiRequestError(500, "SERVER_ERROR", "Crashed");
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiRequestError);
    });

    it("exposes statusCode and errorCode as public fields", () => {
      const error = new ApiRequestError(403, "FORBIDDEN", "No access");
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe("FORBIDDEN");
    });
  });
});
