import { Row, Col } from "antd";
import type { Wallet } from "@/types/wallet";
import { BalanceCard } from "./BalanceCard";

interface BalanceListProps {
  wallets: Wallet[];
}

export function BalanceList({ wallets }: BalanceListProps) {
  return (
    <Row gutter={[16, 16]}>
      {wallets.map((wallet) => (
        <Col key={wallet.id} sm={24} md={12} lg={8}>
          <BalanceCard wallet={wallet} />
        </Col>
      ))}
    </Row>
  );
}
