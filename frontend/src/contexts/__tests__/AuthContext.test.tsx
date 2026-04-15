import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useContext } from "react";
import { AuthProvider } from "../AuthContext";
import { AuthContext, type AuthContextType } from "../authTypes";
import { authApi } from "@/services/api";
import type { AuthUser } from "@/types/auth";

vi.mock("@/services/api", () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn(),
    register: vi.fn(),
  },
}));

const TOKEN_KEY = "auth_token";
const mockedApi = vi.mocked(authApi);

const mockUser: AuthUser = {
  id: 1,
  email: "demo@vitawallet.com",
};

function TestConsumer({
  onState,
}: {
  onState: (state: AuthContextType) => void;
}) {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error("AuthContext not provided");
  }
  onState(ctx);
  return (
    <div>
      <span data-testid="auth">{ctx.isAuthenticated ? "yes" : "no"}</span>
      <span data-testid="loading">{ctx.isLoading ? "yes" : "no"}</span>
      <span data-testid="email">{ctx.user?.email ?? "none"}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts unauthenticated and not loading when no token in storage", async () => {
    const states: AuthContextType[] = [];
    render(
      <AuthProvider>
        <TestConsumer onState={(s) => states.push(s)} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
    expect(screen.getByTestId("email")).toHaveTextContent("none");
    expect(mockedApi.me).not.toHaveBeenCalled();
  });

  it("validates stored token by calling /me on mount and restores session", async () => {
    localStorage.setItem(TOKEN_KEY, "existing-token");
    mockedApi.me.mockResolvedValue({ data: { user: mockUser }, meta: {} });

    render(
      <AuthProvider>
        <TestConsumer onState={() => undefined} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(screen.getByTestId("auth")).toHaveTextContent("yes");
    expect(screen.getByTestId("email")).toHaveTextContent(
      "demo@vitawallet.com",
    );
    expect(mockedApi.me).toHaveBeenCalledOnce();
  });

  it("clears token and user when /me call fails on mount", async () => {
    localStorage.setItem(TOKEN_KEY, "stale-token");
    mockedApi.me.mockRejectedValue(new Error("Token expired"));

    render(
      <AuthProvider>
        <TestConsumer onState={() => undefined} />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });
    expect(screen.getByTestId("auth")).toHaveTextContent("no");
    expect(screen.getByTestId("email")).toHaveTextContent("none");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("login stores token, sets user, and marks authenticated", async () => {
    let capturedContext: AuthContextType | null = null;
    mockedApi.login.mockResolvedValue({
      data: { user: mockUser, token: "new-token" },
      meta: {},
    });

    render(
      <AuthProvider>
        <TestConsumer
          onState={(s) => {
            capturedContext = s;
          }}
        />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });

    const ctx = capturedContext as AuthContextType | null;
    if (ctx === null) {
      throw new Error("Context not captured");
    }

    await act(async () => {
      await ctx.login({
        email: "demo@vitawallet.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("yes");
    });
    expect(screen.getByTestId("email")).toHaveTextContent(
      "demo@vitawallet.com",
    );
    expect(localStorage.getItem(TOKEN_KEY)).toBe("new-token");
    expect(mockedApi.login).toHaveBeenCalledWith({
      email: "demo@vitawallet.com",
      password: "password123",
    });
  });

  it("logout clears token, user, and authenticated state", async () => {
    localStorage.setItem(TOKEN_KEY, "existing-token");
    mockedApi.me.mockResolvedValue({ data: { user: mockUser }, meta: {} });

    let capturedContext: AuthContextType | null = null;
    render(
      <AuthProvider>
        <TestConsumer
          onState={(s) => {
            capturedContext = s;
          }}
        />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("yes");
    });

    const ctx = capturedContext as AuthContextType | null;
    if (ctx === null) {
      throw new Error("Context not captured");
    }

    act(() => {
      ctx.logout();
    });

    await waitFor(() => {
      expect(screen.getByTestId("auth")).toHaveTextContent("no");
    });
    expect(screen.getByTestId("email")).toHaveTextContent("none");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("propagates errors from login so callers can handle them", async () => {
    let capturedContext: AuthContextType | null = null;
    mockedApi.login.mockRejectedValue(new Error("Invalid credentials"));

    render(
      <AuthProvider>
        <TestConsumer
          onState={(s) => {
            capturedContext = s;
          }}
        />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("no");
    });

    const ctx = capturedContext as AuthContextType | null;
    if (ctx === null) {
      throw new Error("Context not captured");
    }

    await expect(
      ctx.login({ email: "bad@test.com", password: "wrong" }),
    ).rejects.toThrow("Invalid credentials");

    expect(screen.getByTestId("auth")).toHaveTextContent("no");
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
