import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { AuthContextType } from "@/contexts/authTypes";

let mockAuthState: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock("@/hooks/useAuth", () => ({
  useAuthContext: (): AuthContextType => mockAuthState,
}));

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderWithRouter(initialPath: string) {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    };
  });

  it("redirects to /login when not authenticated", () => {
    renderWithRouter("/dashboard");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
  });

  it("does not render protected content when unauthenticated", () => {
    renderWithRouter("/dashboard");

    expect(screen.queryByText("Dashboard Content")).toBeNull();
  });

  it("renders children when authenticated", () => {
    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      user: { id: 1, email: "test@example.com" },
      token: "jwt-token",
    };

    renderWithRouter("/dashboard");

    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    mockAuthState = {
      ...mockAuthState,
      isLoading: true,
    };

    renderWithRouter("/dashboard");

    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    // Spin component renders with ant-spin class
    const spinElement = document.querySelector(".ant-spin");
    expect(spinElement).not.toBeNull();
  });
});
