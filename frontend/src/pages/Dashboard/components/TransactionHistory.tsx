import { Typography, Alert, Card, Space } from "antd";
import { useTransactions } from "@/hooks/useTransactions";
import { StatusFilter } from "@/pages/History/components/StatusFilter";
import { TransactionTable } from "@/pages/History/components/TransactionTable";

const { Title } = Typography;

export function TransactionHistory() {
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
    <div>
      <Title
        level={3}
        style={{
          margin: "0 0 16px 0",
          color: "var(--vw-text-primary, #1A2B3C)",
          fontWeight: 700,
        }}
      >
        Historial de transacciones
      </Title>
      <Card
        style={{
          borderRadius: 6,
          border: "2px solid var(--vw-gray-2, #DEE0E0)",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          {isError && (
            <Alert
              type="error"
              message="Error loading transactions"
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
    </div>
  );
}
