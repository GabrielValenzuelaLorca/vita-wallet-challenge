import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import type { WalletSchema } from "@/schemas/wallet";

interface UseBalancesReturn {
  balances: WalletSchema[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

let mockBalancesState: UseBalancesReturn = {
  balances: [],
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("@/hooks/useBalances", () => ({
  useBalances: (): UseBalancesReturn => mockBalancesState,
}));

vi.mock("@/hooks/useTransactions", () => ({
  useTransactions: () => ({
    transactions: [],
    page: 1,
    perPage: 10,
    total: 0,
    statusFilter: undefined,
    setPage: vi.fn(),
    setStatusFilter: vi.fn(),
    isLoading: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuthContext: () => ({
    user: {
      id: 1,
      email: "demo@vitawallet.com",
      created_at: "2026-04-14T00:00:00Z",
      updated_at: "2026-04-14T00:00:00Z",
    },
    token: "test-token",
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function renderDashboard() {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBalancesState = {
      balances: [],
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it("renders the Dashboard greeting with the user name", () => {
    renderDashboard();
    expect(screen.getByRole("heading", { name: /hola demo/i })).toBeInTheDocument();
  });

  it("shows loading spinner when isLoading is true", () => {
    mockBalancesState = {
      ...mockBalancesState,
      isLoading: true,
    };

    const { container } = renderDashboard();
    const spinner = container.querySelector(".ant-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows error alert when isError is true", () => {
    mockBalancesState = {
      ...mockBalancesState,
      isError: true,
      error: new Error("Network error"),
    };

    renderDashboard();

    expect(screen.getByText("Error al cargar los saldos")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders CLP, BTC, and USDT balance cards on dashboard", () => {
    mockBalancesState = {
      balances: [
        { id: 1, currency: "USD", balance: "1000.50" },
        { id: 2, currency: "CLP", balance: "500000" },
        { id: 3, currency: "BTC", balance: "0.05000000" },
        { id: 4, currency: "USDC", balance: "500.00" },
        { id: 5, currency: "USDT", balance: "250.75" },
      ],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();

    expect(screen.getByText("Peso chileno")).toBeInTheDocument();
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.getByText("Tether")).toBeInTheDocument();
    expect(screen.queryByText("US Dollar")).not.toBeInTheDocument();
    expect(screen.queryByText("USD Coin")).not.toBeInTheDocument();
  });

  it("formats CLP balance with es-CL locale and 0 decimals", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "CLP", balance: "500000" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    // es-CL formats CLP as "$500.000" with dot as thousands separator
    expect(screen.getByText(/\$500[.,]000/)).toBeInTheDocument();
  });

  it("formats BTC balance with up to 8 decimals and BTC suffix", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "BTC", balance: "0.05000000" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    expect(screen.getByText("0,05 BTC")).toBeInTheDocument();
  });

  it("formats USDT balance with USDT suffix and 2 decimals", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "USDT", balance: "500.00" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    expect(screen.getByText("500,00 USDT")).toBeInTheDocument();
  });

  it("does not show spinner or alert on success state", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "USD", balance: "100.00" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = renderDashboard();
    const spinningSpinner = container.querySelector(".ant-spin-spinning");
    expect(spinningSpinner).not.toBeInTheDocument();
    expect(screen.queryByText("Error al cargar los saldos")).not.toBeInTheDocument();
  });
});
