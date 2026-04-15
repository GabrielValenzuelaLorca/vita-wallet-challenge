import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, userEvent } from "@/test/testUtils";
import { ExchangePage } from "@/pages/Exchange/ExchangePage";
import type {
  TransactionResponseSchema,
  ExchangeRequest,
} from "@/schemas/transaction";
import type { WalletsResponseSchema } from "@/schemas/wallet";
import type { PricesResponseSchema } from "@/schemas/price";
import { ApiRequestError } from "@/services/httpClient";

type SubmitExchangeFn = (
  request: ExchangeRequest,
) => Promise<TransactionResponseSchema>;
type GetBalancesFn = () => Promise<WalletsResponseSchema>;
type GetPricesFn = () => Promise<PricesResponseSchema>;

const submitExchangeMock = vi.fn<SubmitExchangeFn>();
const getBalancesMock = vi.fn<GetBalancesFn>();
const getPricesMock = vi.fn<GetPricesFn>();

vi.mock("@/services/exchangeApi", () => ({
  exchangeApi: {
    get submitExchange() {
      return submitExchangeMock;
    },
  },
}));

vi.mock("@/services/walletApi", () => ({
  walletApi: {
    get getBalances() {
      return getBalancesMock;
    },
  },
}));

vi.mock("@/services/priceApi", () => ({
  priceApi: {
    get getPrices() {
      return getPricesMock;
    },
  },
}));

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

const pricesResponse: PricesResponseSchema = {
  data: {
    btc: {
      usd_sell: "0.00001538461538", // 1 / 65000
      usd_buy: "0.00001538461538",
      clp_sell: "0.00000001818181818",
      clp_buy: "0.00000001818181818",
    },
    usdc: {
      usd_sell: "1.0",
      usd_buy: "1.0",
    },
    usdt: {
      usd_sell: "1.0",
      usd_buy: "1.0",
    },
  },
};

const balancesResponse: WalletsResponseSchema = {
  data: [
    { id: 1, currency: "USD", balance: "1000.00000000" },
    { id: 2, currency: "BTC", balance: "0.05000000" },
  ],
};

const completedTransaction: TransactionResponseSchema = {
  data: {
    id: 42,
    kind: "exchange",
    source_currency: "USD",
    target_currency: "BTC",
    source_amount: "10",
    target_amount: "0.00015384",
    exchange_rate: "65000",
    status: "completed",
    rejection_reason: null,
    created_at: "2026-04-14T10:00:00Z",
  },
};

const rejectedTransaction: TransactionResponseSchema = {
  data: {
    id: 99,
    kind: "exchange",
    source_currency: "USD",
    target_currency: "BTC",
    source_amount: "9999",
    target_amount: "0",
    exchange_rate: "0",
    status: "rejected",
    rejection_reason: "insufficient_balance",
    created_at: "2026-04-14T10:00:00Z",
  },
};

// Fills the single-page Exchange form (source + target + amount) with
// USD → BTC and the given amount, then clicks "Continuar" to advance to
// the summary view. The summary view exposes an "Intercambiar" button
// the caller is expected to click.
async function fillFormAndContinue(
  user: ReturnType<typeof userEvent.setup>,
  amount: string,
) {
  // Wait for both currency selects to render. There are 2 combobox roles
  // visible at once: [0] source, [1] target.
  const comboboxes = await screen.findAllByRole("combobox");
  await user.click(comboboxes[0]);
  const usdOptions = await screen.findAllByText("USD");
  await user.click(usdOptions[usdOptions.length - 1]);

  await user.click(comboboxes[1]);
  const btcOptions = await screen.findAllByText("BTC");
  await user.click(btcOptions[btcOptions.length - 1]);

  // Two textbox inputs render too: [0] is the editable source amount,
  // [1] is the read-only estimate. Type the amount into the first.
  const amountInputs = await screen.findAllByPlaceholderText("0,00");
  await user.clear(amountInputs[0]);
  await user.type(amountInputs[0], amount);

  await user.click(screen.getByRole("button", { name: /continuar/i }));
  // Wait for the summary view to render.
  await screen.findByRole("button", { name: /^intercambiar$/i });
}

describe("ExchangePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPricesMock.mockResolvedValue(pricesResponse);
    getBalancesMock.mockResolvedValue(balancesResponse);
  });

  it("renders the Exchange form prompt", async () => {
    render(<ExchangePage />);
    expect(
      await screen.findByRole("heading", {
        name: /¿qué deseas intercambiar\?/i,
        level: 3,
      }),
    ).toBeInTheDocument();
  });

  it("shows the form with a Continuar button after data loads", async () => {
    render(<ExchangePage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /continuar/i }),
      ).toBeInTheDocument();
    });
  });

  it("submits the exchange and shows the success modal", async () => {
    submitExchangeMock.mockResolvedValueOnce(completedTransaction);
    const user = userEvent.setup();
    render(<ExchangePage />);

    await fillFormAndContinue(user, "10");
    await user.click(screen.getByRole("button", { name: /^intercambiar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/¡intercambio exitoso!/i)).toBeInTheDocument();
    });
    expect(submitExchangeMock).toHaveBeenCalled();
  });

  it("shows error alert when exchange fails with ApiRequestError", async () => {
    submitExchangeMock.mockRejectedValueOnce(
      new ApiRequestError(422, "insufficient_balance", "Not enough USD"),
    );
    const user = userEvent.setup();
    render(<ExchangePage />);

    await fillFormAndContinue(user, "10");
    await user.click(screen.getByRole("button", { name: /^intercambiar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/error en el intercambio/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/not enough usd/i)).toBeInTheDocument();
  });

  it("shows rejected alert when backend returns a rejected transaction", async () => {
    submitExchangeMock.mockResolvedValueOnce(rejectedTransaction);
    const user = userEvent.setup();
    render(<ExchangePage />);

    await fillFormAndContinue(user, "10");
    await user.click(screen.getByRole("button", { name: /^intercambiar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/intercambio rechazado/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/insufficient_balance/i)).toBeInTheDocument();
  });

  it("returns to the form when closing the success modal", async () => {
    submitExchangeMock.mockResolvedValueOnce(completedTransaction);
    const user = userEvent.setup();
    render(<ExchangePage />);

    await fillFormAndContinue(user, "10");
    await user.click(screen.getByRole("button", { name: /^intercambiar$/i }));

    await waitFor(() =>
      expect(screen.getByText(/¡intercambio exitoso!/i)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /continuar/i }),
      ).toBeInTheDocument(),
    );
  });
});
