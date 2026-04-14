import { Select } from "antd";
import type { TransactionStatus } from "@/types/transaction";

interface StatusFilterProps {
  value: TransactionStatus | undefined;
  onChange: (status: TransactionStatus | undefined) => void;
}

const OPTIONS: { label: string; value: TransactionStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Select<TransactionStatus>
      placeholder="Filter by status"
      allowClear
      style={{ width: 200 }}
      value={value}
      onChange={(selected) => onChange(selected ?? undefined)}
      options={OPTIONS}
    />
  );
}
