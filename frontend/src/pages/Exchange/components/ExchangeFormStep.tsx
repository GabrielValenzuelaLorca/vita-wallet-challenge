import { Form, Typography, Space } from "antd";
import type { Currency, Wallet } from "@/types/wallet";
import { formatCurrency } from "@/utils/formatCurrency";
import { VitaButton } from "@/components/VitaButton";
import { VitaSelector } from "@/components/VitaSelector";
import { VitaTextField } from "@/components/VitaTextField";

import dollarSignIcon from "@/assets/illustrations/dollar-sign.png";

const CURRENCIES_WITH_DOLLAR_SYMBOL: Currency[] = ["USD", "CLP", "USDC", "USDT"];

function currencyPrefix(currency: Currency | null): React.ReactNode {
  if (!currency || !CURRENCIES_WITH_DOLLAR_SYMBOL.includes(currency)) {
    return undefined;
  }
  return (
    <img
      src={dollarSignIcon}
      alt=""
      style={{ width: 20, height: 20, filter: "brightness(0)" }}
    />
  );
}

const { Title, Text } = Typography;

interface ExchangeFormStepProps {
  currencies: readonly Currency[];
  balances: Wallet[];
  sourceCurrency: Currency | null;
  targetCurrency: Currency | null;
  amount: string;
  estimate: string | null;
  isPricesLoading: boolean;
  onSourceCurrencyChange: (currency: Currency) => void;
  onTargetCurrencyChange: (currency: Currency) => void;
  onAmountChange: (amount: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function findBalance(
  balances: Wallet[],
  currency: Currency | null,
): Wallet | null {
  if (!currency) return null;
  return balances.find((wallet) => wallet.currency === currency) ?? null;
}

export function ExchangeFormStep({
  currencies,
  balances,
  sourceCurrency,
  targetCurrency,
  amount,
  estimate,
  isPricesLoading,
  onSourceCurrencyChange,
  onTargetCurrencyChange,
  onAmountChange,
  onBack,
  onContinue,
}: ExchangeFormStepProps) {
  const sourceBalance = findBalance(balances, sourceCurrency);
  const numericAmount = Number(amount);
  const isAmountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const numericBalance = sourceBalance ? parseFloat(sourceBalance.balance) : 0;
  const exceedsBalance = isAmountValid && numericAmount > numericBalance;
  const isSameCurrency =
    sourceCurrency !== null && sourceCurrency === targetCurrency;
  const canContinue =
    !!sourceCurrency &&
    !!targetCurrency &&
    !isSameCurrency &&
    isAmountValid &&
    !exceedsBalance &&
    estimate !== null;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <Title
        level={3}
        style={{
          margin: 0,
          marginBottom: 40,
          color: "var(--vw-black, #010E11)",
          fontWeight: 600,
          fontSize: 28,
          lineHeight: "38px",
        }}
      >
        ¿Qué deseas intercambiar?
      </Title>
      <div
        style={{
          height: 22,
          marginBottom: 48,
        }}
      >
        {sourceBalance && (
          <Text
            style={{
                  color: "var(--vw-blue-2, #05BCB9)",
              fontSize: 16,
              fontWeight: 600,
              lineHeight: "22px",
            }}
          >
            Saldo disponible:{" "}
            {formatCurrency(sourceBalance.balance, sourceBalance.currency)}
          </Text>
        )}
      </div>

      <Form layout="vertical" requiredMark={false}>
        <Form.Item
          label={
            <Text
              style={{
                color: "var(--vw-black, #010E11)",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: "22px",
              }}
            >
              Monto a intercambiar
            </Text>
          }
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            <VitaSelector
              value={sourceCurrency ?? undefined}
              onChange={onSourceCurrencyChange}
              currencies={currencies}
            />
            <div style={{ flex: 1 }}>
              <VitaTextField
                variant="amount"
                placeholder="0,00"
                value={amount}
                onChange={onAmountChange}
                prefix={currencyPrefix(sourceCurrency)}
                error={exceedsBalance ? "Saldo insuficiente" : undefined}
              />
            </div>
          </div>
          {exceedsBalance && (
            <Text
              type="danger"
              style={{ display: "block", marginTop: 6, fontSize: 13 }}
            >
              Saldo insuficiente
            </Text>
          )}
        </Form.Item>

        <Form.Item
          label={
            <Text
              style={{
                color: "var(--vw-black, #010E11)",
                fontSize: 16,
                fontWeight: 400,
                lineHeight: "22px",
              }}
            >
              Quiero recibir
            </Text>
          }
          validateStatus={isSameCurrency ? "error" : undefined}
          help={
            isSameCurrency ? "Debe ser distinta a la moneda de origen" : undefined
          }
          style={{ marginBottom: 48 }}
        >
          <div style={{ display: "flex", gap: 16, width: "100%" }}>
            <VitaSelector
              value={targetCurrency ?? undefined}
              onChange={onTargetCurrencyChange}
              currencies={currencies}
            />
            <div style={{ flex: 1 }}>
              <VitaTextField
                variant="amount"
                placeholder="0,00"
                value={isPricesLoading ? "" : estimate ?? ""}
                disabled={!targetCurrency}
                prefix={currencyPrefix(targetCurrency)}
                inputProps={{ readOnly: true }}
              />
            </div>
          </div>
        </Form.Item>
      </Form>

      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 48,
        }}
      >
        <div style={{ width: 183 }}>
          <VitaButton variant="secondary" block onClick={onBack}>
            Atrás
          </VitaButton>
        </div>
        <div style={{ width: 183 }}>
          <VitaButton block disabled={!canContinue} onClick={onContinue}>
            Continuar
          </VitaButton>
        </div>
      </Space>
    </div>
  );
}
