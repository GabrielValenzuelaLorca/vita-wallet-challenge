import { Form, Select, InputNumber, Button, Typography } from "antd";
import type { Currency, Wallet } from "@/types/wallet";

interface ExchangeFormProps {
  currencies: readonly Currency[];
  balances: Wallet[];
  sourceCurrency: Currency | null;
  targetCurrency: Currency | null;
  amount: string;
  estimate: string | null;
  isPricesLoading: boolean;
  isSubmitting: boolean;
  onSourceCurrencyChange: (currency: Currency) => void;
  onTargetCurrencyChange: (currency: Currency) => void;
  onAmountChange: (amount: string) => void;
  onSubmit: () => void;
}

const { Text } = Typography;

function formatBalance(balance: string, currency: Currency): string {
  const numericBalance = parseFloat(balance);
  switch (currency) {
    case "USD":
      return numericBalance.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "CLP":
      return numericBalance.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    case "BTC": {
      const formatted = numericBalance
        .toFixed(8)
        .replace(/0+$/, "")
        .replace(/\.$/, "");
      return `${formatted} BTC`;
    }
    case "USDC":
    case "USDT":
      return `$${numericBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
  }
}

function findBalance(
  balances: Wallet[],
  currency: Currency | null,
): Wallet | null {
  if (!currency) {
    return null;
  }
  return balances.find((wallet) => wallet.currency === currency) ?? null;
}

function buildCurrencyOptions(
  currencies: readonly Currency[],
): { label: Currency; value: Currency }[] {
  return currencies.map((currency) => ({
    label: currency,
    value: currency,
  }));
}

export function ExchangeForm({
  currencies,
  balances,
  sourceCurrency,
  targetCurrency,
  amount,
  estimate,
  isPricesLoading,
  isSubmitting,
  onSourceCurrencyChange,
  onTargetCurrencyChange,
  onAmountChange,
  onSubmit,
}: ExchangeFormProps) {
  const sourceBalance = findBalance(balances, sourceCurrency);
  const numericAmount = Number(amount);
  const isAmountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const isSameCurrency =
    sourceCurrency !== null && sourceCurrency === targetCurrency;
  const canSubmit =
    !!sourceCurrency &&
    !!targetCurrency &&
    !isSameCurrency &&
    isAmountValid &&
    estimate !== null &&
    !isSubmitting;

  const estimateDisplay = (() => {
    if (isPricesLoading) {
      return "Calculating...";
    }
    if (estimate === null || !targetCurrency) {
      return "--";
    }
    return `${estimate} ${targetCurrency}`;
  })();

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <Typography.Title level={3}>Exchange</Typography.Title>
      <Form layout="vertical">
        <Form.Item label="Source currency">
          <Select<Currency>
            placeholder="Select source currency"
            value={sourceCurrency ?? undefined}
            onChange={onSourceCurrencyChange}
            options={buildCurrencyOptions(currencies)}
          />
        </Form.Item>

        <Form.Item label="Target currency">
          <Select<Currency>
            placeholder="Select target currency"
            value={targetCurrency ?? undefined}
            onChange={onTargetCurrencyChange}
            options={buildCurrencyOptions(currencies)}
          />
        </Form.Item>

        <Form.Item label="Amount">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={0.01}
            stringMode
            value={amount === "" ? null : amount}
            onChange={(value) =>
              onAmountChange(value === null || value === undefined ? "" : String(value))
            }
          />
          {sourceBalance && (
            <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              Available: {formatBalance(sourceBalance.balance, sourceBalance.currency)}
            </Text>
          )}
        </Form.Item>

        <Form.Item>
          <Text strong>Estimated: </Text>
          <Text>{estimateDisplay}</Text>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            block
            loading={isSubmitting}
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            Confirm Exchange
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
