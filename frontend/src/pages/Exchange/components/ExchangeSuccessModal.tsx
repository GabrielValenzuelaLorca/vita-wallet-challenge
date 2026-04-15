import { Modal, Typography } from "antd";
import type { Currency } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";
import { VitaButton } from "@/components/VitaButton";

import exchangeSuccessIllustration from "@/assets/illustrations/exchange-success.png";

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
      <img
        src={exchangeSuccessIllustration}
        alt="Intercambio exitoso"
        style={{
          width: 220,
          maxWidth: "100%",
          margin: "0 auto 24px",
          display: "block",
        }}
      />

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

      <VitaButton onClick={onClose}>
        Hacer otro intercambio
      </VitaButton>
    </Modal>
  );
}
