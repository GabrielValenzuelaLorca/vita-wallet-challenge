import { Card, Typography } from "antd";
import type { Wallet, Currency } from "@/types/wallet";

import bitcoinIcon from "@/assets/illustrations/bitcoin.png";
import usdcIcon from "@/assets/illustrations/usdc.png";
import tetherIcon from "@/assets/illustrations/tether.png";
import dollarIcon from "@/assets/illustrations/dollar-sign.png";
import chileIcon from "@/assets/illustrations/chile.png";

const { Text, Title } = Typography;

interface BalanceCardProps {
  wallet: Wallet;
}

interface CurrencyMeta {
  label: string;
  symbol: string;
  icon: string;
  accentBg: string;
  accentFg: string;
}

const CURRENCY_META: Record<Currency, CurrencyMeta> = {
  USD: {
    label: "US Dollar",
    symbol: "USD",
    icon: dollarIcon,
    accentBg: "rgba(5, 188, 185, 0.12)",
    accentFg: "#05BCB9",
  },
  CLP: {
    label: "Peso Chileno",
    symbol: "CLP",
    icon: chileIcon,
    accentBg: "rgba(22, 114, 135, 0.12)",
    accentFg: "#167287",
  },
  BTC: {
    label: "Bitcoin",
    symbol: "BTC",
    icon: bitcoinIcon,
    accentBg: "rgba(245, 165, 36, 0.14)",
    accentFg: "#F5A524",
  },
  USDC: {
    label: "USD Coin",
    symbol: "USDC",
    icon: usdcIcon,
    accentBg: "rgba(46, 116, 191, 0.12)",
    accentFg: "#2E74BF",
  },
  USDT: {
    label: "Tether",
    symbol: "USDT",
    icon: tetherIcon,
    accentBg: "rgba(38, 161, 123, 0.12)",
    accentFg: "#26A17B",
  },
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
        borderRadius: 16,
        border: "1px solid var(--vw-border, #E5EAEE)",
        boxShadow: "var(--vw-shadow-card, 0 2px 8px rgba(15,35,50,0.06))",
        height: "100%",
      }}
      styles={{ body: { padding: 24 } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <Text
            style={{
              color: "var(--vw-text-secondary, #5A6B7B)",
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 0.6,
              fontWeight: 500,
            }}
          >
            {meta.symbol}
          </Text>
          <div
            style={{
              color: "var(--vw-text-muted, #8A99A8)",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {meta.label}
          </div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: meta.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={meta.icon}
            alt={meta.label}
            style={{ width: 26, height: 26 }}
          />
        </div>
      </div>
      <Title
        level={3}
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 700,
          color: "var(--vw-text-primary, #1A2B3C)",
          letterSpacing: -0.4,
        }}
      >
        {formatBalance(wallet.balance, wallet.currency)}
      </Title>
    </Card>
  );
}
