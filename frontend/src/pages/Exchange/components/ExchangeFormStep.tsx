import { Form, InputNumber, Typography, Space } from "antd";
import type { Currency, Wallet } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";
import { VitaButton } from "@/components/VitaButton";
import { VitaSelector } from "@/components/VitaSelector";

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
    <div style={{ width: "100%" }}>
      <Title
        level={3}
        style={{
          margin: 0,
          marginBottom: 8,
          color: "var(--vw-text-primary, #010E11)",
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        ¿Qué deseas intercambiar?
      </Title>
      {sourceBalance && (
        <Text
          style={{
            display: "block",
            marginBottom: 32,
            color: "var(--vw-primary, #05BCB9)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Saldo disponible:{" "}
          {formatCurrency(sourceBalance.balance, sourceBalance.currency)}
        </Text>
      )}
      {!sourceBalance && (
        <Text
          style={{
            display: "block",
            marginBottom: 32,
            color: "var(--vw-text-muted, #B9C1C2)",
            fontSize: 14,
          }}
        >
          Selecciona una moneda para ver el saldo disponible
        </Text>
      )}

      <Form layout="vertical" requiredMark={false}>
        <Form.Item
          label={
            <Text
              style={{
                color: "var(--vw-text-secondary, #5A6B7B)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Monto a intercambiar
            </Text>
          }
        >
          <Space.Compact style={{ width: "100%" }}>
            <VitaSelector
              value={sourceCurrency ?? undefined}
              onChange={onSourceCurrencyChange}
              currencies={currencies}
            />
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              stringMode
              size="large"
              placeholder="0,00"
              value={amount === "" ? null : amount}
              onChange={(value) =>
                onAmountChange(
                  value === null || value === undefined ? "" : String(value),
                )
              }
              status={exceedsBalance ? "error" : undefined}
            />
          </Space.Compact>
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
                color: "var(--vw-text-secondary, #5A6B7B)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Quiero recibir
            </Text>
          }
          validateStatus={isSameCurrency ? "error" : undefined}
          help={
            isSameCurrency ? "Debe ser distinta a la moneda de origen" : undefined
          }
        >
          <Space.Compact style={{ width: "100%" }}>
            <VitaSelector
              value={targetCurrency ?? undefined}
              onChange={onTargetCurrencyChange}
              currencies={currencies}
            />
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder="0,00"
              value={isPricesLoading ? null : estimate}
              readOnly
              disabled={!targetCurrency}
              stringMode
            />
          </Space.Compact>
        </Form.Item>

        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <VitaButton
            variant="secondary"
            vitaSize="compact"
            onClick={onBack}
          >
            Atrás
          </VitaButton>
          <VitaButton
            vitaSize="compact"
            disabled={!canContinue}
            onClick={onContinue}
          >
            Continuar
          </VitaButton>
        </Space>
      </Form>
    </div>
  );
}
