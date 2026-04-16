import { Row, Col, Typography } from "antd";
import type { Wallet } from "@/types/wallet";
import { BalanceCard } from "./BalanceCard";

const { Text } = Typography;

interface BalanceListProps {
  wallets: Wallet[];
}

export function BalanceList({ wallets }: BalanceListProps) {
  if (wallets.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Text style={{ color: "var(--vw-gray-1, #B9C1C2)" }}>
          No tienes saldos disponibles aún
        </Text>
      </div>
    );
  }

  return (
    <Row gutter={[20, 20]}>
      {wallets.map((wallet) => (
        <Col key={wallet.id} sm={24} md={12} lg={8}>
          <BalanceCard wallet={wallet} />
        </Col>
      ))}
    </Row>
  );
}
