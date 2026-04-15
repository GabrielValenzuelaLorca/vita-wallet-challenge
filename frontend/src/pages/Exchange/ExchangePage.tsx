import { useMemo, useState } from "react";
import { Typography, Spin, Card, Space } from "antd";
import { useExchange } from "@/hooks/useExchange";
import { ExchangeForm } from "./components/ExchangeForm";
import { ExchangeResult } from "./components/ExchangeResult";
import type { Currency } from "@/types/wallet";

const CURRENCIES: readonly Currency[] = [
  "USD",
  "CLP",
  "BTC",
  "USDC",
  "USDT",
] as const;

const { Title } = Typography;

export function ExchangePage() {
  const [sourceCurrency, setSourceCurrency] = useState<Currency | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<Currency | null>(null);
  const [amount, setAmount] = useState<string>("");

  const {
    submitExchange,
    calculateEstimate,
    reset,
    result,
    error,
    isSubmitting,
    isPricesLoading,
    balances,
    isBalancesLoading,
  } = useExchange();

  const estimate = useMemo(
    () => calculateEstimate(sourceCurrency, targetCurrency, amount),
    [calculateEstimate, sourceCurrency, targetCurrency, amount],
  );

  // When the user picks a source equal to the current target (or vice
  // versa), swap the two so any currency is always pickable on either side.
  const handleSourceCurrencyChange = (next: Currency) => {
    if (next === targetCurrency) {
      setTargetCurrency(sourceCurrency);
    }
    setSourceCurrency(next);
  };

  const handleTargetCurrencyChange = (next: Currency) => {
    if (next === sourceCurrency) {
      setSourceCurrency(targetCurrency);
    }
    setTargetCurrency(next);
  };

  const handleSubmit = () => {
    if (!sourceCurrency || !targetCurrency) {
      return;
    }
    submitExchange({
      source_currency: sourceCurrency,
      target_currency: targetCurrency,
      amount,
    });
  };

  const handleNewExchange = () => {
    reset();
    setSourceCurrency(null);
    setTargetCurrency(null);
    setAmount("");
  };

  const showResult = result !== null || error !== null;
  const isDataLoading = isPricesLoading || isBalancesLoading;

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Title level={2}>Exchange</Title>
      {isDataLoading && !showResult && (
        <div style={{ textAlign: "center", padding: 24 }}>
          <Spin size="large" />
        </div>
      )}
      {showResult ? (
        <Card>
          <ExchangeResult
            transaction={result}
            error={error}
            onNewExchange={handleNewExchange}
          />
        </Card>
      ) : (
        !isDataLoading && (
          <Card>
            <ExchangeForm
              currencies={CURRENCIES}
              balances={balances}
              sourceCurrency={sourceCurrency}
              targetCurrency={targetCurrency}
              amount={amount}
              estimate={estimate}
              isPricesLoading={isPricesLoading}
              isSubmitting={isSubmitting}
              onSourceCurrencyChange={handleSourceCurrencyChange}
              onTargetCurrencyChange={handleTargetCurrencyChange}
              onAmountChange={setAmount}
              onSubmit={handleSubmit}
            />
          </Card>
        )
      )}
    </Space>
  );
}
