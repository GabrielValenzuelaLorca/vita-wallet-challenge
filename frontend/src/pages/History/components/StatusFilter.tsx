import { VitaSelect } from "@/components/VitaSelect";
import type { TransactionStatus } from "@/types/transaction";

interface StatusFilterProps {
  value: TransactionStatus | undefined;
  onChange: (status: TransactionStatus | undefined) => void;
}

const OPTIONS: { label: string; value: TransactionStatus }[] = [
  { label: "Pendientes", value: "pending" },
  { label: "Completadas", value: "completed" },
  { label: "Rechazadas", value: "rejected" },
];

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <VitaSelect<TransactionStatus>
      placeholder="Todos"
      allowClear
      style={{ width: 200 }}
      value={value}
      onChange={(selected) => onChange(selected ?? undefined)}
      options={OPTIONS}
    />
  );
}
