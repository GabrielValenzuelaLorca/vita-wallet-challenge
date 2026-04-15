import { Card, Typography } from "antd";
import type { Wallet, Currency } from "@/types/wallet";

import bitcoinIcon from "@/assets/illustrations/bitcoin.png";
import usdcIcon from "@/assets/illustrations/usdc.png";
import tetherIcon from "@/assets/illustrations/tether.png";
import dollarIcon from "@/assets/illustrations/dollar-sign.png";
import chileIcon from "@/assets/illustrations/chile.png";

const { Text } = Typography;

interface BalanceCardProps {
  wallet: Wallet;
}

interface CurrencyMeta {
  label: string;
  icon: string;
}

const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  USD: { label: "US Dollar", icon: dollarIcon },
  CLP: { label: "Peso chileno", icon: chileIcon },
  BTC: { label: "Bitcoin", icon: bitcoinIcon },
  USDC: { label: "USD Coin", icon: usdcIcon },
  USDT: { label: "Tether", icon: tetherIcon },
};

function formatBalance(balance: string, currency: Currency): string {
  const numericBalance = parseFloat(balance);

  switch (currency) {
    case "USD":
      return numericBalance.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "CLP":
      return numericBalance.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      });
    case "BTC": {
      const formatted = numericBalance
        .toFixed(8)
        .replace(/0+$/, "")
        .replace(/\.$/, "");
      return `${formatted || "0"} BTC`;
    }
    case "USDC":
    case "USDT":
      return `${numericBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currency}`;
  }
}

export function BalanceCard({ wallet }: BalanceCardProps) {
  const meta = CURRENCY_META[wallet.currency];

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
            fontFamily: "'Open Sans', sans-serif",
            fontWeight: 400,
            fontSize: 16,
            lineHeight: "22px",
            color: "var(--vw-black, #010E11)",
          }}
        >
          {meta.label}
        </Text>
        <img
          src={meta.icon}
          alt={meta.label}
          style={{ width: 24, height: 24 }}
        />
      </div>
      <Text
        style={{
          display: "block",
          margin: 0,
          fontFamily: "'Open Sans', sans-serif",
          fontSize: 24,
          fontWeight: 600,
          lineHeight: "33px",
          color: "var(--vw-black, #010E11)",
        }}
      >
        {formatBalance(wallet.balance, wallet.currency)}
      </Text>
    </Card>
  );
}
