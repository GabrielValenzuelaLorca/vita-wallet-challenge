import { Typography, Alert, Card, Space } from "antd";
import { useTransactions } from "@/hooks/useTransactions";
import { StatusFilter } from "./components/StatusFilter";
import { TransactionTable } from "./components/TransactionTable";

const { Title, Text } = Typography;

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Historial de transacciones
        </Title>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: "var(--vw-text-secondary, #5A6B7B)",
            }}
          >
            Filtrar por estado
          </Text>
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
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
