import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "@/pages/Login/LoginPage";
import type { AuthContextType } from "@/contexts/authTypes";

interface UseLoginFormReturn {
  isSubmitting: boolean;
  errorMessage: string | null;
  handleLogin: () => Promise<void>;
}

const mockHandleLogin = vi.fn();
let mockLoginFormState: UseLoginFormReturn = {
  isSubmitting: false,
  errorMessage: null,
  handleLogin: mockHandleLogin,
};

let mockAuthState: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

vi.mock("@/hooks/useLoginForm", () => ({
  useLoginForm: (): UseLoginFormReturn => mockLoginFormState,
}));

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

function renderLoginPage(initialPath = "/login") {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginFormState = {
      isSubmitting: false,
      errorMessage: null,
      handleLogin: mockHandleLogin,
    };
    mockAuthState = {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
  });

  it("renders email input, password input, and submit button", () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText("juan@gmail.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Escribe tu contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar sesión/i }),
    ).toBeInTheDocument();
  });

  it("renders login heading", () => {
    renderLoginPage();

    expect(screen.getByRole("heading", { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it("shows error Alert when errorMessage is provided", () => {
    mockLoginFormState = {
      ...mockLoginFormState,
      errorMessage: "Invalid credentials",
    };

    renderLoginPage();

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows loading state on submit button when isSubmitting is true", () => {
    mockLoginFormState = {
      ...mockLoginFormState,
      isSubmitting: true,
    };

    renderLoginPage();

    const button = screen.getByRole("button", { name: /iniciar sesión/i });
    expect(button).toBeInTheDocument();
  });

  it("redirects to / when already authenticated", () => {
    mockAuthState = {
      ...mockAuthState,
      isAuthenticated: true,
      user: { id: 1, email: "test@example.com" },
      token: "jwt-token",
    };

    renderLoginPage();

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("juan@gmail.com")).not.toBeInTheDocument();
  });
});
