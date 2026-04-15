import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TransactionSchema } from "@/schemas/transaction";
import type { TransactionStatus } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatCurrency";

interface TransactionTableProps {
  transactions: TransactionSchema[];
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

const columns: ColumnsType<TransactionSchema> = [
  {
    title: "Date",
    dataIndex: "created_at",
    key: "created_at",
    render: (value: string) => new Date(value).toLocaleString(),
  },
  {
    title: "From",
    key: "from",
    render: (_value, record) =>
      formatCurrency(record.source_amount, record.source_currency),
  },
  {
    title: "To",
    key: "to",
    render: (_value, record) =>
      record.status === "rejected"
        ? "--"
        : formatCurrency(record.target_amount, record.target_currency),
  },
  {
    title: "Rate",
    dataIndex: "exchange_rate",
    key: "exchange_rate",
    render: (value: string) => parseFloat(value).toString(),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (value: TransactionStatus) => (
      <Tag color={STATUS_COLORS[value]}>{value.toUpperCase()}</Tag>
    ),
  },
  {
    title: "Reason",
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
    <Table<TransactionSchema>
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
        showTotal: (count) => `Total: ${count} transactions`,
      }}
    />
  );
}
