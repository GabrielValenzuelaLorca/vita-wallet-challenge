import { Layout, Typography, Spin, Alert } from "antd";
import { useBalances } from "@/hooks/useBalances";
import { BalanceList } from "./components/BalanceList";

const { Content } = Layout;
const { Title } = Typography;

export function DashboardPage() {
  const { balances, isLoading, isError, error } = useBalances();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Title level={2}>Dashboard</Title>
        {isLoading && (
          <div style={{ textAlign: "center", padding: 48 }}>
            <Spin size="large" />
          </div>
        )}
        {isError && (
          <Alert
            type="error"
            title="Error loading balances"
            description={error?.message ?? "An unexpected error occurred"}
            showIcon
          />
        )}
        {!isLoading && !isError && <BalanceList wallets={balances} />}
      </Content>
    </Layout>
  );
}
