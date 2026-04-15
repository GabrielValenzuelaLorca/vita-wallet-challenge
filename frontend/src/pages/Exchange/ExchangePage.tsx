import { useMemo, useState } from "react";
import { Card, Space, Spin, Steps, Typography } from "antd";
import { useExchange } from "@/hooks/useExchange";
import { SourceStep } from "./components/SourceStep";
import { TargetStep } from "./components/TargetStep";
import { ReviewStep } from "./components/ReviewStep";
import { ExchangeResult } from "./components/ExchangeResult";
import type { Currency } from "@/types/wallet";

const CURRENCIES: readonly Currency[] = [
  "USD",
  "CLP",
  "BTC",
  "USDC",
  "USDT",
] as const;

const { Title, Text } = Typography;

type WizardStep = 0 | 1 | 2;

export function ExchangePage() {
  const [step, setStep] = useState<WizardStep>(0);
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

  const handleSourceCurrencyChange = (next: Currency) => {
    if (next === targetCurrency) {
      setTargetCurrency(null);
    }
    setSourceCurrency(next);
  };

  const handleTargetCurrencyChange = (next: Currency) => {
    if (next === sourceCurrency) {
      setSourceCurrency(targetCurrency);
    }
    setTargetCurrency(next);
  };

  const handleConfirm = () => {
    if (!sourceCurrency || !targetCurrency) return;
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
    setStep(0);
  };

  const showResult = result !== null || error !== null;
  const isDataLoading = isPricesLoading || isBalancesLoading;

  if (showResult) {
    return (
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <PageHeader />
        <Card style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
          <ExchangeResult
            transaction={result}
            error={error}
            onNewExchange={handleNewExchange}
          />
        </Card>
      </Space>
    );
  }

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeader />

      <Card
        style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}
        styles={{ body: { padding: 32 } }}
      >
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 32 }}
          items={[
            { title: "Source" },
            { title: "Target" },
            { title: "Review" },
          ]}
        />

        {isDataLoading && step === 0 && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin size="large" />
          </div>
        )}

        {!isDataLoading && step === 0 && (
          <SourceStep
            currencies={CURRENCIES}
            balances={balances}
            sourceCurrency={sourceCurrency}
            amount={amount}
            onSourceCurrencyChange={handleSourceCurrencyChange}
            onAmountChange={setAmount}
            onNext={() => setStep(1)}
          />
        )}

        {step === 1 && sourceCurrency && (
          <TargetStep
            currencies={CURRENCIES}
            sourceCurrency={sourceCurrency}
            amount={amount}
            targetCurrency={targetCurrency}
            estimate={estimate}
            isPricesLoading={isPricesLoading}
            onTargetCurrencyChange={handleTargetCurrencyChange}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && sourceCurrency && targetCurrency && estimate && (
          <ReviewStep
            sourceCurrency={sourceCurrency}
            targetCurrency={targetCurrency}
            amount={amount}
            estimate={estimate}
            isSubmitting={isSubmitting}
            onBack={() => setStep(1)}
            onConfirm={handleConfirm}
          />
        )}
      </Card>
    </Space>
  );
}

function PageHeader() {
  return (
    <div>
      <Title
        level={2}
        style={{
          margin: 0,
          color: "var(--vw-text-primary, #1A2B3C)",
          fontWeight: 700,
        }}
      >
        Exchange
      </Title>
      <Text
        style={{
          color: "var(--vw-text-secondary, #5A6B7B)",
          fontSize: 15,
        }}
      >
        Convert between fiat and crypto using live market prices.
      </Text>
    </div>
  );
}
