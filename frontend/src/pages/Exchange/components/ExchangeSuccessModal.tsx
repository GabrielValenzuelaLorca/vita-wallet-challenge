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
      width={561}
      styles={{
        content: {
          background: "var(--vw-white, #F9F9FA)",
          borderRadius: 6,
        },
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
          width: 280,
          maxWidth: "100%",
          margin: "0 auto 24px",
          display: "block",
        }}
      />

      <Title
        level={3}
        style={{
          margin: 0,
          fontFamily: "'Open Sans', sans-serif",
          color: "var(--vw-blue-1, #167287)",
          fontWeight: 600,
          fontSize: 28,
          lineHeight: "38px",
        }}
      >
        ¡Intercambio exitoso!
      </Title>
      <Text
        style={{
          display: "block",
          marginTop: 8,
          marginBottom: 32,
          fontFamily: "'Open Sans', sans-serif",
          color: "var(--vw-black, #010E11)",
          fontSize: 16,
          lineHeight: "22px",
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
