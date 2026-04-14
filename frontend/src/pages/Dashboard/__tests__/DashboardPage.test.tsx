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

  it("renders the Dashboard title", () => {
    renderDashboard();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
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

    expect(screen.getByText("Error loading balances")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders 5 balance cards with correct currency labels", () => {
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

    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("CLP")).toBeInTheDocument();
    expect(screen.getByText("BTC")).toBeInTheDocument();
    expect(screen.getByText("USDC")).toBeInTheDocument();
    expect(screen.getByText("USDT")).toBeInTheDocument();
  });

  it("formats USD balance with dollar sign and 2 decimals", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "USD", balance: "1000.50" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    expect(screen.getByText("$1,000.50")).toBeInTheDocument();
  });

  it("formats CLP balance with dollar sign and 0 decimals", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "CLP", balance: "500000" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    expect(screen.getByText("$500,000")).toBeInTheDocument();
  });

  it("formats BTC balance with up to 8 decimals and BTC suffix", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "BTC", balance: "0.05000000" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    expect(screen.getByText("0.05 BTC")).toBeInTheDocument();
  });

  it("formats USDC balance with dollar sign and 2 decimals", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "USDC", balance: "500.00" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    renderDashboard();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });

  it("does not show spinner or alert on success state", () => {
    mockBalancesState = {
      balances: [{ id: 1, currency: "USD", balance: "100.00" }],
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = renderDashboard();
    const spinner = container.querySelector(".ant-spin");
    expect(spinner).not.toBeInTheDocument();
    expect(screen.queryByText("Error loading balances")).not.toBeInTheDocument();
  });
});
