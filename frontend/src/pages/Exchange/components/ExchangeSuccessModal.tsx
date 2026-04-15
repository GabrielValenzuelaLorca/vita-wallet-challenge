import { Modal, Typography, Button } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import type { Currency } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";

const { Title, Text } = Typography;

interface ExchangeSuccessModalProps {
  open: boolean;
  targetCurrency: Currency;
  targetAmount: string;
  onClose: () => void;
}

export function ExchangeSuccessModal({
  open,
  targetCurrency,
  targetAmount,
  onClose,
}: ExchangeSuccessModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      styles={{
        body: {
          padding: "48px 32px 32px",
          textAlign: "center",
        },
      }}
    >
      {/* Illustration placeholder — replace with the Figma "Intercambio
          exitoso" 3D asset once exported to
          src/assets/illustrations/exchange-success.png */}
      <div
        style={{
          width: 180,
          height: 180,
          margin: "0 auto 24px",
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(5,188,185,0.14), rgba(22,114,135,0.14))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircleFilled
          style={{
            fontSize: 100,
            color: "var(--vw-primary, #05BCB9)",
          }}
        />
      </div>

      <Title
        level={3}
        style={{
          margin: 0,
          color: "var(--vw-primary, #05BCB9)",
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        ¡Intercambio exitoso!
      </Title>
      <Text
        style={{
          display: "block",
          marginTop: 8,
          marginBottom: 32,
          color: "var(--vw-text-secondary, #5A6B7B)",
          fontSize: 15,
        }}
      >
        Ya cuentas con los {formatCurrency(targetAmount, targetCurrency)} en
        tu saldo.
      </Text>

      <Button
        type="primary"
        size="large"
        onClick={onClose}
        style={{ borderRadius: 999, minWidth: 200 }}
      >
        Hacer otro intercambio
      </Button>
    </Modal>
  );
}
