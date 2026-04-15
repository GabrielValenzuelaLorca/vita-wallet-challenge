import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Space, Spin, Typography, Alert } from "antd";
import { useExchange } from "@/hooks/useExchange";
import { ExchangeFormStep } from "./components/ExchangeFormStep";
import { ExchangeSummary } from "./components/ExchangeSummary";
import { ExchangeSuccessModal } from "./components/ExchangeSuccessModal";
import type { Currency } from "@/types/wallet";

const CURRENCIES: readonly Currency[] = [
  "USD",
  "CLP",
  "BTC",
  "USDC",
  "USDT",
] as const;

const { Title, Text } = Typography;

type View = "form" | "summary";

export function ExchangePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("form");
  const [showSuccess, setShowSuccess] = useState(false);
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

  // Open success modal when the mutation resolves with a completed
  // transaction. Rejected/error responses stay on the summary view so the
  // user can read the alert and retry.
  useEffect(() => {
    if (result && result.status === "completed") {
      setShowSuccess(true);
    }
  }, [result]);

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

  const resetWizard = () => {
    reset();
    setSourceCurrency(null);
    setTargetCurrency(null);
    setAmount("");
    setView("form");
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetWizard();
  };

  const isDataLoading = isPricesLoading || isBalancesLoading;
  const apiError = error;
  const rejectedTransaction =
    result && result.status !== "completed" ? result : null;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "var(--vw-text-primary, #010E11)",
            fontWeight: 700,
          }}
        >
          Intercambiar
        </Title>
        <Text
          style={{
            color: "var(--vw-text-secondary, #5A6B7B)",
            fontSize: 15,
          }}
        >
          Convierte entre fiat y crypto usando precios de mercado en tiempo real.
        </Text>
      </div>

      <Card
        style={{
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
          borderRadius: 16,
          border: "1px solid var(--vw-border, #DEE0E0)",
        }}
        styles={{ body: { padding: 40 } }}
      >
        {(apiError || rejectedTransaction) && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 12 }}
            message={
              rejectedTransaction
                ? "Intercambio rechazado"
                : "Error en el intercambio"
            }
            description={
              rejectedTransaction
                ? rejectedTransaction.rejection_reason ?? "Rechazado por el servidor"
                : apiError
            }
            closable
            onClose={() => reset()}
          />
        )}

        {isDataLoading && view === "form" && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin size="large" />
          </div>
        )}

        {!isDataLoading && view === "form" && (
          <ExchangeFormStep
            currencies={CURRENCIES}
            balances={balances}
            sourceCurrency={sourceCurrency}
            targetCurrency={targetCurrency}
            amount={amount}
            estimate={estimate}
            isPricesLoading={isPricesLoading}
            onSourceCurrencyChange={handleSourceCurrencyChange}
            onTargetCurrencyChange={handleTargetCurrencyChange}
            onAmountChange={setAmount}
            onBack={() => navigate("/")}
            onContinue={() => setView("summary")}
          />
        )}

        {view === "summary" && sourceCurrency && targetCurrency && estimate && (
          <ExchangeSummary
            sourceCurrency={sourceCurrency}
            targetCurrency={targetCurrency}
            amount={amount}
            estimate={estimate}
            isSubmitting={isSubmitting}
            onBack={() => setView("form")}
            onConfirm={handleConfirm}
          />
        )}
      </Card>

      <ExchangeSuccessModal
        open={showSuccess}
        targetCurrency={targetCurrency ?? "BTC"}
        targetAmount={result?.target_amount ?? "0"}
        onClose={handleSuccessClose}
      />
    </Space>
  );
}
