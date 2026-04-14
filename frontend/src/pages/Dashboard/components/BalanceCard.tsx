import { Card, Statistic } from "antd";
import type { Wallet, Currency } from "@/types/wallet";

interface BalanceCardProps {
  wallet: Wallet;
}

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
      return numericBalance.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).replace("$", "$");
    case "BTC": {
      const formatted = numericBalance.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
      return `${formatted} BTC`;
    }
    case "USDC":
    case "USDT":
      return `$${numericBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
  }
}

export function BalanceCard({ wallet }: BalanceCardProps) {
  return (
    <Card>
      <Statistic
        title={wallet.currency}
        value={formatBalance(wallet.balance, wallet.currency)}
      />
    </Card>
  );
}
