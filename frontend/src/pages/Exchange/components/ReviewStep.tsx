import { Button, Typography, Space, Divider } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import type { Currency } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";

const { Text, Title } = Typography;

interface ReviewStepProps {
  sourceCurrency: Currency;
  targetCurrency: Currency;
  amount: string;
  estimate: string;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

interface RowProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

function Row({ label, value, emphasis }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "10px 0",
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
        strong={emphasis}
        style={{
          fontSize: emphasis ? 18 : 14,
          color: emphasis
            ? "var(--vw-text-primary, #1A2B3C)"
            : "var(--vw-text-primary, #1A2B3C)",
        }}
      >
        {value}
      </Text>
    </div>
  );
}

export function ReviewStep({
  sourceCurrency,
  targetCurrency,
  amount,
  estimate,
  isSubmitting,
  onBack,
  onConfirm,
}: ReviewStepProps) {
  const numericAmount = parseFloat(amount);
  const numericEstimate = parseFloat(estimate);
  const exchangeRate =
    Number.isFinite(numericAmount) && numericAmount > 0
      ? numericEstimate / numericAmount
      : 0;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Title
          level={3}
          style={{
            margin: 0,
            color: "var(--vw-text-primary, #1A2B3C)",
            fontWeight: 700,
          }}
        >
          Review and confirm
        </Title>
        <Text
          style={{
            color: "var(--vw-text-secondary, #5A6B7B)",
            fontSize: 14,
          }}
        >
          Make sure these details look right before submitting.
        </Text>
      </div>

      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: "var(--vw-bg, #F4F7F9)",
          border: "1px solid var(--vw-border, #E5EAEE)",
        }}
      >
        <Row
          label="You exchange"
          value={formatCurrency(amount, sourceCurrency)}
          emphasis
        />
        <Divider style={{ margin: "8px 0" }} />
        <Row
          label="You receive (estimated)"
          value={formatCurrency(estimate, targetCurrency)}
          emphasis
        />
        <Divider style={{ margin: "8px 0" }} />
        <Row
          label="Exchange rate"
          value={`1 ${sourceCurrency} ≈ ${exchangeRate.toFixed(8)} ${targetCurrency}`}
        />
        <Row label="Fee" value="0.00" />
      </div>

      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <Button
          size="large"
          onClick={onBack}
          icon={<ArrowLeftOutlined />}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="primary"
          size="large"
          loading={isSubmitting}
          onClick={onConfirm}
          icon={<CheckOutlined />}
        >
          Confirm Exchange
        </Button>
      </Space>
    </Space>
  );
}
