import { Modal, Typography } from "antd";
import type { Currency } from "@/types/wallet";

import exchangeSuccessIllustration from "@/assets/illustrations/exchange-success.png";

const { Title, Text } = Typography;

interface ExchangeSuccessModalProps {
  open: boolean;
  targetCurrency: Currency;
  onClose: () => void;
}

export function ExchangeSuccessModal({
  open,
  targetCurrency,
  onClose,
}: ExchangeSuccessModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={561}
      closeIcon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6L18 18M18 6L6 18"
            stroke="#010E11"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      }
      styles={{
        body: {
          background: "var(--vw-white, #F9F9FA)",
          borderRadius: 6,
          height: 566,
          padding: "80px 64px 32px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        },
      }}
    >
      <img
        src={exchangeSuccessIllustration}
        alt="Intercambio exitoso"
        style={{
          width: 308,
          maxWidth: "100%",
          margin: "0 auto 16px",
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
          textAlign: "center",
        }}
      >
        ¡Intercambio exitoso!
      </Title>
      <Text
        style={{
          display: "block",
          marginTop: 8,
          fontFamily: "'Open Sans', sans-serif",
          color: "var(--vw-black, #010E11)",
          fontSize: 16,
          lineHeight: "22px",
          textAlign: "center",
        }}
      >
        Ya cuentas con los {targetCurrency} en tu saldo.
      </Text>
    </Modal>
  );
}
