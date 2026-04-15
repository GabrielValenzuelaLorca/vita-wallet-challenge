import { Button, Typography, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import type { Currency } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";

const { Text, Title } = Typography;

interface ExchangeSummaryProps {
  sourceCurrency: Currency;
  targetCurrency: Currency;
  amount: string;
  estimate: string;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "12px 0",
      }}
    >
      <Text
        style={{
          color: "var(--vw-text-secondary, #5A6B7B)",
          fontSize: 14,
        }}
      >
        {label}
      </Text>
      <Text
        strong
        style={{
          fontSize: highlight ? 20 : 15,
          color: highlight
            ? "var(--vw-primary, #05BCB9)"
            : "var(--vw-text-primary, #010E11)",
          fontWeight: highlight ? 700 : 600,
        }}
      >
        {value}
      </Text>
    </div>
  );
}

export function ExchangeSummary({
  sourceCurrency,
  targetCurrency,
  amount,
  estimate,
  isSubmitting,
  onBack,
  onConfirm,
}: ExchangeSummaryProps) {
  const numericAmount = parseFloat(amount);
  const numericEstimate = parseFloat(estimate);
  // "Tasa de cambio" expressed as 1 target = X source (so the larger unit
  // appears on the left of the equation, matching the Figma example
  // "1 BTC = 62.512.668,43 CLP").
  const rateTargetToSource =
    Number.isFinite(numericEstimate) && numericEstimate > 0
      ? numericAmount / numericEstimate
      : 0;
  const rateLine = `1 ${targetCurrency} = ${formatCurrency(rateTargetToSource, sourceCurrency)}`;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          disabled={isSubmitting}
          style={{ padding: 4 }}
          aria-label="Volver"
        />
        <Title
          level={3}
          style={{
            margin: 0,
            color: "var(--vw-text-primary, #010E11)",
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          Resumen de transacción
        </Title>
      </div>

      <div
        style={{
          padding: "8px 4px 24px",
          marginBottom: 32,
          borderBottom: "1px solid var(--vw-border, #DEE0E0)",
        }}
      >
        <SummaryRow
          label="Monto a intercambiar"
          value={formatCurrency(amount, sourceCurrency)}
        />
        <SummaryRow label="Tasa de cambio" value={rateLine} />
        <SummaryRow
          label="Total a recibir"
          value={formatCurrency(estimate, targetCurrency)}
          highlight
        />
      </div>

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Button
          size="large"
          onClick={onBack}
          disabled={isSubmitting}
          style={{ borderRadius: 999, minWidth: 120 }}
        >
          Atrás
        </Button>
        <Button
          type="primary"
          size="large"
          loading={isSubmitting}
          onClick={onConfirm}
          style={{ borderRadius: 999, minWidth: 160 }}
        >
          Intercambiar
        </Button>
      </Space>
    </div>
  );
}
