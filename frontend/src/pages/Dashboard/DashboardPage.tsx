import { Typography, Spin, Alert, Space } from "antd";
import { useBalances } from "@/hooks/useBalances";
import { BalanceList } from "./components/BalanceList";

const { Title } = Typography;

export function DashboardPage() {
  const { balances, isLoading, isError, error } = useBalances();

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Title level={2}>Dashboard</Title>
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
