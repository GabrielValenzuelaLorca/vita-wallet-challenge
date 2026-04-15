import { Typography, Spin, Alert, Space } from "antd";
import { useBalances } from "@/hooks/useBalances";
import { useAuthContext } from "@/hooks/useAuth";
import { BalanceList } from "./components/BalanceList";

const { Title, Text } = Typography;

export function DashboardPage() {
  const { balances, isLoading, isError, error } = useBalances();
  const { user } = useAuthContext();

  const greeting = user?.email?.split("@")[0] ?? "there";

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <div>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "var(--vw-text-primary, #1A2B3C)",
            fontWeight: 700,
          }}
        >
          Welcome back, {greeting}
        </Title>
        <Text
          style={{
            color: "var(--vw-text-secondary, #5A6B7B)",
            fontSize: 15,
          }}
        >
          Here is a summary of your wallet balances
        </Text>
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
      {!isLoading && !isError && <BalanceList wallets={balances} />}
    </Space>
  );
}
