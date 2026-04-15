import { Form, Select, Button, Typography, Space, Spin } from "antd";
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import type { Currency } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";

const { Text, Title } = Typography;

interface TargetStepProps {
  currencies: readonly Currency[];
  sourceCurrency: Currency;
  amount: string;
  targetCurrency: Currency | null;
  estimate: string | null;
  isPricesLoading: boolean;
  onTargetCurrencyChange: (currency: Currency) => void;
  onBack: () => void;
  onNext: () => void;
}

export function TargetStep({
  currencies,
  sourceCurrency,
  amount,
  targetCurrency,
  estimate,
  isPricesLoading,
  onTargetCurrencyChange,
  onBack,
  onNext,
}: TargetStepProps) {
  const isSameCurrency = targetCurrency === sourceCurrency;
  const canProceed = !!targetCurrency && !isSameCurrency && estimate !== null;

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
          What do you want to receive?
        </Title>
        <Text
          style={{
            color: "var(--vw-text-secondary, #5A6B7B)",
            fontSize: 14,
          }}
        >
          Pick the destination currency. The estimate updates with live
          prices.
        </Text>
      </div>

      {/* Source recap */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          background: "var(--vw-bg, #F4F7F9)",
          border: "1px solid var(--vw-border, #E5EAEE)",
        }}
      >
        <Text
          style={{
            display: "block",
            color: "var(--vw-text-muted, #8A99A8)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          You exchange
        </Text>
        <Text
          strong
          style={{
            fontSize: 18,
            color: "var(--vw-text-primary, #1A2B3C)",
          }}
        >
          {formatCurrency(amount, sourceCurrency)}
        </Text>
      </div>

      <Form layout="vertical" requiredMark={false}>
        <Form.Item
          label="Target currency"
          validateStatus={isSameCurrency ? "error" : undefined}
          help={
            isSameCurrency
              ? "Source and target must be different"
              : undefined
          }
        >
          <Select<Currency>
            placeholder="Select target currency"
            value={targetCurrency ?? undefined}
            onChange={onTargetCurrencyChange}
            options={currencies.map((c) => ({ label: c, value: c }))}
            size="large"
          />
        </Form.Item>

        <div
          style={{
            padding: "16px 20px",
            borderRadius: 12,
            background:
              "linear-gradient(135deg, rgba(7,165,167,0.06), rgba(0,59,70,0.04))",
            border: "1px solid var(--vw-border, #E5EAEE)",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              display: "block",
              color: "var(--vw-text-muted, #8A99A8)",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              marginBottom: 4,
            }}
          >
            You receive (estimated)
          </Text>
          {isPricesLoading ? (
            <Spin size="small" />
          ) : (
            <Text
              strong
              style={{
                fontSize: 22,
                color: "var(--vw-primary, #07A5A7)",
                fontWeight: 700,
              }}
            >
              {targetCurrency && estimate
                ? formatCurrency(estimate, targetCurrency)
                : "--"}
            </Text>
          )}
        </div>

        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Button
            size="large"
            onClick={onBack}
            icon={<ArrowLeftOutlined />}
          >
            Back
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={!canProceed}
            onClick={onNext}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
          >
            Review
          </Button>
        </Space>
      </Form>
    </Space>
  );
}
