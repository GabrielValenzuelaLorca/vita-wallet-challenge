import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi } from "@/services/api";
import { httpClient, ApiRequestError } from "@/services/httpClient";
import type { AuthResponseSchema } from "@/schemas/auth";
import type { MeResponseSchema } from "@/schemas/auth";

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
const mockedGet = vi.mocked(httpClient.get);

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("calls httpClient.post with correct path and body", async () => {
      const mockResponse: AuthResponseSchema = {
        data: {
          token: "jwt-token-123",
          user: { id: 1, email: "test@example.com" },
        },
      };
      mockedPost.mockResolvedValue(mockResponse);

      const result = await authApi.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(mockedPost).toHaveBeenCalledWith("/auth/login", {
        body: { email: "test@example.com", password: "password123" },
      });
      expect(result.data.token).toBe("jwt-token-123");
      expect(result.data.user.email).toBe("test@example.com");
    });

    it("propagates ApiRequestError from httpClient", async () => {
      mockedPost.mockRejectedValue(
        new ApiRequestError(401, "invalid_credentials", "Invalid credentials"),
      );

      await expect(
        authApi.login({ email: "bad@example.com", password: "wrong" }),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("register", () => {
    it("calls httpClient.post with correct path and body", async () => {
      const mockResponse: AuthResponseSchema = {
        data: {
          token: "jwt-token-456",
          user: { id: 2, email: "new@example.com" },
        },
      };
      mockedPost.mockResolvedValue(mockResponse);

      const result = await authApi.register({
        email: "new@example.com",
        password: "password123",
      });

      expect(mockedPost).toHaveBeenCalledWith("/auth/register", {
        body: { email: "new@example.com", password: "password123" },
      });
      expect(result.data.token).toBe("jwt-token-456");
      expect(result.data.user.id).toBe(2);
    });
  });

  describe("me", () => {
    it("calls httpClient.get with correct path", async () => {
      const mockResponse: MeResponseSchema = {
        data: {
          user: { id: 1, email: "test@example.com" },
        },
      };
      mockedGet.mockResolvedValue(mockResponse);

      const result = await authApi.me();

      expect(mockedGet).toHaveBeenCalledWith("/auth/me");
      expect(result.data.user.email).toBe("test@example.com");
    });

    it("propagates error when token is invalid", async () => {
      mockedGet.mockRejectedValue(
        new ApiRequestError(401, "unauthorized", "Not authenticated"),
      );

      await expect(authApi.me()).rejects.toThrow("Not authenticated");
    });
  });
});
