import { Typography, Alert, Card, Space } from "antd";
import { useTransactions } from "@/hooks/useTransactions";
import { StatusFilter } from "./components/StatusFilter";
import { TransactionTable } from "./components/TransactionTable";

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
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Title level={2}>Historial de transacciones</Title>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          {isError && (
            <Alert
              type="error"
              message="Error al cargar las transacciones"
              description={error?.message ?? "Ocurrió un error inesperado"}
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
  );
}
