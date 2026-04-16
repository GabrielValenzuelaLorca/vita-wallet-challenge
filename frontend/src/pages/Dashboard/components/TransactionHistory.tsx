import { Typography, Alert, Spin } from "antd";
import { useTransactions } from "@/hooks/useTransactions";
import type { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/utils/formatCurrency";

const { Title, Text } = Typography;

type TransactionKind = "received" | "deducted" | "exchanged";

interface TransactionDisplay {
  label: string;
  prefix: string;
  color: string;
}

function getTransactionDisplay(
  kind: TransactionKind,
  action: string,
): TransactionDisplay {
  switch (kind) {
    case "received":
      return {
        label: action,
        prefix: "+ ",
        color: "var(--vw-blue-2, #05BCB9)",
      };
    case "deducted":
      return {
        label: action,
        prefix: "- ",
        color: "var(--vw-red, #CE3434)",
      };
    case "exchanged":
      return {
        label: action,
        prefix: "",
        color: "var(--vw-black, #010E11)",
      };
  }
}

function describeTransaction(transaction: Transaction): {
  kind: TransactionKind;
  action: string;
  amount: string;
} {
  switch (transaction.kind) {
    case "deposit":
      return {
        kind: "received",
        action: "Recibiste",
        amount: formatCurrency(
          transaction.target_amount,
          transaction.target_currency,
        ),
      };
    case "recharge":
      return {
        kind: "received",
        action: "Recargaste",
        amount: formatCurrency(
          transaction.target_amount,
          transaction.target_currency,
        ),
      };
    case "transfer":
      return {
        kind: "deducted",
        action: "Transferiste",
        amount: formatCurrency(
          transaction.source_amount,
          transaction.source_currency,
        ),
      };
    case "exchange":
      return {
        kind: "exchanged",
        action: "Intercambiaste",
        amount: formatCurrency(
          transaction.target_amount,
          transaction.target_currency,
        ),
      };
  }
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { kind, action, amount } = describeTransaction(transaction);
  const display = getTransactionDisplay(kind, action);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        borderBottom: "1px solid var(--vw-gray-2, #DEE0E0)",
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: 400,
          lineHeight: "22px",
          color: "var(--vw-black, #010E11)",
        }}
      >
        {display.label}
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: 600,
          lineHeight: "22px",
          color: display.color,
          textAlign: "right",
        }}
      >
        {display.prefix}
        {amount}
      </Text>
    </div>
  );
}

export function TransactionHistory() {
  const { transactions, isLoading, isError, error } = useTransactions();

  return (
    <div>
      <Title
        level={3}
        style={{
          margin: "0 0 16px 0",
          fontWeight: 400,
          fontSize: 24,
          lineHeight: "33px",
          color: "var(--vw-black, #010E11)",
        }}
      >
        Historial
      </Title>

      {isError && (
        <Alert
          type="error"
          title="Error al cargar las transacciones"
          description={error?.message ?? "Ocurrió un error inesperado"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      {isLoading && (
        <div style={{ textAlign: "center", padding: 48 }}>
          <Spin />
        </div>
      )}
      {!isLoading && !isError && transactions.length === 0 && (
        <div style={{ padding: 24, textAlign: "center" }}>
          <Text style={{ color: "var(--vw-gray-1, #B9C1C2)" }}>
            No hay transacciones aún
          </Text>
        </div>
      )}
      {!isLoading && !isError && transactions.length > 0 && (
        <div style={{ maxHeight: 538, overflowY: "auto" }}>
          {transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
