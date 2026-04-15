import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin, Alert } from "antd";
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
    <div
      style={{
        maxWidth: 483,
        width: "100%",
        minHeight: "calc(100vh - 160px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {(apiError || rejectedTransaction) && (
        <Alert
          type="error"
          showIcon
          style={{ borderRadius: 12, marginBottom: 24 }}
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

      <ExchangeSuccessModal
        open={showSuccess}
        targetCurrency={targetCurrency ?? "BTC"}
        onClose={handleSuccessClose}
      />
    </div>
  );
}
