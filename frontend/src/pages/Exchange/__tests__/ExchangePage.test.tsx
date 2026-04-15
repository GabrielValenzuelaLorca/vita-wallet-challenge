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

// Walks the wizard through all 3 steps with USD -> BTC and the given
// amount, ending on the Review step where a "Confirm Exchange" button is
// visible. Caller is responsible for clicking that button.
async function walkWizardToReview(
  user: ReturnType<typeof userEvent.setup>,
  amount: string,
) {
  // Step 1: pick source currency (the only combobox visible) + amount
  const sourceSelect = (await screen.findAllByRole("combobox"))[0];
  await user.click(sourceSelect);
  const usdOptions = await screen.findAllByText("USD");
  await user.click(usdOptions[usdOptions.length - 1]);

  const amountInput = await screen.findByRole("spinbutton");
  await user.clear(amountInput);
  await user.type(amountInput, amount);
  await user.click(screen.getByRole("button", { name: /continue/i }));

  // Step 2: pick target currency
  const targetSelect = (await screen.findAllByRole("combobox"))[0];
  await user.click(targetSelect);
  const btcOptions = await screen.findAllByText("BTC");
  await user.click(btcOptions[btcOptions.length - 1]);
  await user.click(screen.getByRole("button", { name: /review/i }));

  // Step 3: review screen with Confirm Exchange button
  await screen.findByRole("button", { name: /confirm exchange/i });
}

describe("ExchangePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPricesMock.mockResolvedValue(pricesResponse);
    getBalancesMock.mockResolvedValue(balancesResponse);
  });

  it("renders the Exchange title", async () => {
    render(<ExchangePage />);
    expect(
      await screen.findByRole("heading", { name: /exchange/i, level: 2 }),
    ).toBeInTheDocument();
  });

  it("shows the source step (Continue button) after data loads", async () => {
    render(<ExchangePage />);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeInTheDocument();
    });
  });

  it("walks through the wizard and shows the success result", async () => {
    submitExchangeMock.mockResolvedValueOnce(completedTransaction);
    const user = userEvent.setup();
    render(<ExchangePage />);

    await walkWizardToReview(user, "10");
    await user.click(screen.getByRole("button", { name: /confirm exchange/i }));

    await waitFor(() => {
      expect(screen.getByText(/exchange completed/i)).toBeInTheDocument();
    });
    expect(submitExchangeMock).toHaveBeenCalled();
  });

  it("shows error result when exchange fails with ApiRequestError", async () => {
    submitExchangeMock.mockRejectedValueOnce(
      new ApiRequestError(422, "insufficient_balance", "Not enough USD"),
    );
    const user = userEvent.setup();
    render(<ExchangePage />);

    await walkWizardToReview(user, "10");
    await user.click(screen.getByRole("button", { name: /confirm exchange/i }));

    await waitFor(() => {
      expect(screen.getByText(/exchange failed/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/not enough usd/i)).toBeInTheDocument();
  });

  it("shows rejected result when backend returns a rejected transaction", async () => {
    submitExchangeMock.mockResolvedValueOnce(rejectedTransaction);
    const user = userEvent.setup();
    render(<ExchangePage />);

    await walkWizardToReview(user, "10");
    await user.click(screen.getByRole("button", { name: /confirm exchange/i }));

    await waitFor(() => {
      expect(screen.getByText(/exchange rejected/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/insufficient_balance/i)).toBeInTheDocument();
  });

  it("returns to the source step when clicking New Exchange", async () => {
    submitExchangeMock.mockResolvedValueOnce(completedTransaction);
    const user = userEvent.setup();
    render(<ExchangePage />);

    await walkWizardToReview(user, "10");
    await user.click(screen.getByRole("button", { name: /confirm exchange/i }));

    await waitFor(() =>
      expect(screen.getByText(/exchange completed/i)).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: /new exchange/i }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /continue/i }),
      ).toBeInTheDocument(),
    );
  });
});
