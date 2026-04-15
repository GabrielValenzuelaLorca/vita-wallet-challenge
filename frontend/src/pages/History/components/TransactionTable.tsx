import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Transaction, TransactionStatus } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatCurrency";

interface TransactionTableProps {
  transactions: Transaction[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const STATUS_COLORS: Record<TransactionStatus, string> = {
  pending: "blue",
  completed: "green",
  rejected: "red",
};

const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "Pendiente",
  completed: "Completada",
  rejected: "Rechazada",
};

const columns: ColumnsType<Transaction> = [
  {
    title: "Fecha",
    dataIndex: "created_at",
    key: "created_at",
    render: (value: string) => new Date(value).toLocaleString("es-CL"),
  },
  {
    title: "Desde",
    key: "from",
    render: (_value, record) =>
      formatCurrency(record.source_amount, record.source_currency),
  },
  {
    title: "Hacia",
    key: "to",
    render: (_value, record) =>
      record.status === "rejected"
        ? "--"
        : formatCurrency(record.target_amount, record.target_currency),
  },
  {
    title: "Tasa",
    dataIndex: "exchange_rate",
    key: "exchange_rate",
    render: (value: string) => parseFloat(value).toString(),
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    render: (value: TransactionStatus) => (
      <Tag color={STATUS_COLORS[value]}>{STATUS_LABELS[value]}</Tag>
    ),
  },
  {
    title: "Motivo",
    dataIndex: "rejection_reason",
    key: "rejection_reason",
    render: (value: string | null) => value ?? "--",
  },
];

export function TransactionTable({
  transactions,
  page,
  perPage,
  total,
  onPageChange,
  isLoading,
}: TransactionTableProps) {
  return (
    <Table<Transaction>
      rowKey="id"
      loading={isLoading}
      dataSource={transactions}
      columns={columns}
      pagination={{
        current: page,
        pageSize: perPage,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
        showTotal: (count) => `Total: ${count} transacciones`,
      }}
    />
  );
}
