import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TransactionSchema } from "@/schemas/transaction";
import type { Currency } from "@/types/wallet";
import type { TransactionStatus } from "@/types/transaction";

interface TransactionTableProps {
  transactions: TransactionSchema[];
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

function formatAmount(amount: string, currency: Currency): string {
  const numeric = parseFloat(amount);
  switch (currency) {
    case "USD":
      return numeric.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    case "CLP":
      return numeric.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    case "BTC": {
      const formatted = numeric
        .toFixed(8)
        .replace(/0+$/, "")
        .replace(/\.$/, "");
      return `${formatted} BTC`;
    }
    case "USDC":
    case "USDT":
      return `$${numeric.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
  }
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
      formatAmount(record.source_amount, record.source_currency),
  },
  {
    title: "To",
    key: "to",
    render: (_value, record) =>
      record.status === "rejected"
        ? "--"
        : formatAmount(record.target_amount, record.target_currency),
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
