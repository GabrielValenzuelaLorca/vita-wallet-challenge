import { Typography, Spin, Alert, Space } from "antd";
import { useBalances } from "@/hooks/useBalances";
import { useAuthContext } from "@/hooks/useAuth";
import { BalanceList } from "./components/BalanceList";
import { TransactionHistory } from "./components/TransactionHistory";

import coinLogo from "@/assets/illustrations/coin-logo.png";

const { Title } = Typography;

export function DashboardPage() {
  const { balances, isLoading, isError, error } = useBalances();
  const { user } = useAuthContext();

  const greeting = user?.email?.split("@")[0] ?? "there";

  return (
    <Space direction="vertical" size={80} style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img src={coinLogo} alt="" style={{ width: 36, height: 36 }} />
        <Title
          level={2}
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: 28,
            lineHeight: "38px",
            color: "var(--vw-black, #010E11)",
          }}
        >
          ¡Hola <span style={{ color: "var(--vw-blue-2, #05BCB9)" }}>{greeting}</span>!
        </Title>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin size="large" />
        </div>
      )}
      {isError && (
        <Alert
          type="error"
          message="Error loading balances"
          description={error?.message ?? "An unexpected error occurred"}
          showIcon
        />
      )}
      {!isLoading && !isError && (
        <div>
          <Title
            level={3}
            style={{
              margin: "0 0 16px 0",
              fontWeight: 400,
              fontSize: 24,
              lineHeight: "33px",
              color: "var(--vw-black, #010E11)",
            }}
          >
            Mis saldos
          </Title>
          <BalanceList
            wallets={balances.filter((w) =>
              ["CLP", "BTC", "USDT"].includes(w.currency),
            )}
          />
        </div>
      )}

      <TransactionHistory />
    </Space>
  );
}
