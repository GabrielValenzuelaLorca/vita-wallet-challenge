import { Card, Typography } from "antd";
import type { Wallet } from "@/types/wallet";
import { formatCurrency } from "@/utils/formatCurrency";
import { CURRENCY_ICONS, CURRENCY_NAMES } from "@/constants/currency";

const { Text } = Typography;

interface BalanceCardProps {
  wallet: Wallet;
}

export function BalanceCard({ wallet }: BalanceCardProps) {
  const name = CURRENCY_NAMES[wallet.currency];
  const icon = CURRENCY_ICONS[wallet.currency];

  return (
    <Card
      style={{
        borderRadius: 6,
        border: "2px solid var(--vw-gray-2, #DEE0E0)",
        background: "var(--vw-gray-3, #F5F6F7)",
        boxShadow: "none",
        height: "100%",
      }}
      styles={{ body: { padding: "24px 24px 20px" } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "22px",
            color: "var(--vw-black, #010E11)",
          }}
        >
          {name}
        </Text>
        <img
          src={icon}
          alt={name}
          style={{ width: 24, height: 24 }}
        />
      </div>
      <Text
        style={{
          display: "block",
          margin: 0,
          fontSize: 24,
          fontWeight: 600,
          lineHeight: "33px",
          color: "var(--vw-black, #010E11)",
        }}
      >
        {formatCurrency(wallet.balance, wallet.currency)}
      </Text>
    </Card>
  );
}
