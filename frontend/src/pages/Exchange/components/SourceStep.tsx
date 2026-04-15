import { Form, Select, InputNumber, Button, Typography, Space } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import type { Currency, Wallet } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";

const { Text, Title } = Typography;

interface SourceStepProps {
  currencies: readonly Currency[];
  balances: Wallet[];
  sourceCurrency: Currency | null;
  amount: string;
  onSourceCurrencyChange: (currency: Currency) => void;
  onAmountChange: (amount: string) => void;
  onNext: () => void;
}

function findBalance(
  balances: Wallet[],
  currency: Currency | null,
): Wallet | null {
  if (!currency) return null;
  return balances.find((wallet) => wallet.currency === currency) ?? null;
}

export function SourceStep({
  currencies,
  balances,
  sourceCurrency,
  amount,
  onSourceCurrencyChange,
  onAmountChange,
  onNext,
}: SourceStepProps) {
  const sourceBalance = findBalance(balances, sourceCurrency);
  const numericAmount = Number(amount);
  const isAmountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const numericBalance = sourceBalance ? parseFloat(sourceBalance.balance) : 0;
  const exceedsBalance = isAmountValid && numericAmount > numericBalance;
  const canProceed = !!sourceCurrency && isAmountValid && !exceedsBalance;

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
          What do you want to exchange?
        </Title>
        <Text
          style={{
            color: "var(--vw-text-secondary, #5A6B7B)",
            fontSize: 14,
          }}
        >
          Pick the currency you want to convert from and the amount.
        </Text>
      </div>

      <Form layout="vertical" requiredMark={false}>
        <Form.Item label="Source currency">
          <Select<Currency>
            placeholder="Select source currency"
            value={sourceCurrency ?? undefined}
            onChange={onSourceCurrencyChange}
            options={currencies.map((c) => ({ label: c, value: c }))}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Amount">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={0.01}
            stringMode
            size="large"
            value={amount === "" ? null : amount}
            onChange={(value) =>
              onAmountChange(value === null || value === undefined ? "" : String(value))
            }
            status={exceedsBalance ? "error" : undefined}
          />
          {sourceBalance && (
            <Text
              type={exceedsBalance ? "danger" : "secondary"}
              style={{ display: "block", marginTop: 6, fontSize: 13 }}
            >
              {exceedsBalance ? "Insufficient balance · " : "Available: "}
              {formatCurrency(sourceBalance.balance, sourceBalance.currency)}
            </Text>
          )}
        </Form.Item>

        <Button
          type="primary"
          block
          size="large"
          disabled={!canProceed}
          onClick={onNext}
          icon={<ArrowRightOutlined />}
          iconPosition="end"
        >
          Continue
        </Button>
      </Form>
    </Space>
  );
}
