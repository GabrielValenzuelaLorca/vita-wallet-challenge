import { Result, Button } from "antd";
import type { TransactionSchema } from "@/schemas/transaction";

interface ExchangeResultProps {
  transaction: TransactionSchema | null;
  error: string | null;
  onNewExchange: () => void;
}

function buildSuccessSubtitle(transaction: TransactionSchema): string {
  return `Converted ${transaction.source_amount} ${transaction.source_currency} -> ${transaction.target_amount} ${transaction.target_currency} @ rate ${transaction.exchange_rate}`;
}

export function ExchangeResult({
  transaction,
  error,
  onNewExchange,
}: ExchangeResultProps) {
  if (transaction?.status === "completed") {
    return (
      <Result
        status="success"
        title="Exchange Completed"
        subTitle={buildSuccessSubtitle(transaction)}
        extra={<Button onClick={onNewExchange}>New Exchange</Button>}
      />
    );
  }

  if (transaction?.status === "rejected") {
    return (
      <Result
        status="error"
        title="Exchange Rejected"
        subTitle={transaction.rejection_reason ?? "Unknown reason"}
        extra={<Button onClick={onNewExchange}>Try Again</Button>}
      />
    );
  }

  if (transaction?.status === "pending") {
    return (
      <Result
        status="info"
        title="Exchange Pending"
        subTitle="Your exchange is being processed"
        extra={<Button onClick={onNewExchange}>New Exchange</Button>}
      />
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Exchange Failed"
        subTitle={error}
        extra={<Button onClick={onNewExchange}>Try Again</Button>}
      />
    );
  }

  return null;
}
