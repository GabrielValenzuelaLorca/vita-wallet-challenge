import { Layout, Typography, Alert, Card, Space } from "antd";
import { Link } from "react-router-dom";
import { useTransactions } from "@/hooks/useTransactions";
import { StatusFilter } from "./components/StatusFilter";
import { TransactionTable } from "./components/TransactionTable";

const { Content } = Layout;
const { Title } = Typography;

export function HistoryPage() {
  const {
    transactions,
    page,
    perPage,
    total,
    statusFilter,
    setPage,
    setStatusFilter,
    isLoading,
    isError,
    error,
  } = useTransactions();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Title level={2}>Transaction History</Title>
          <Link to="/">Back to Dashboard</Link>
          <Card>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <StatusFilter value={statusFilter} onChange={setStatusFilter} />
              {isError && (
                <Alert
                  type="error"
                  title="Error loading transactions"
                  description={error?.message ?? "An unexpected error occurred"}
                  showIcon
                />
              )}
              <TransactionTable
                transactions={transactions}
                page={page}
                perPage={perPage}
                total={total}
                onPageChange={setPage}
                isLoading={isLoading}
              />
            </Space>
          </Card>
        </Space>
      </Content>
    </Layout>
  );
}
