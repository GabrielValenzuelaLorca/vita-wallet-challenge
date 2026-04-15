import { Typography } from "antd";
import type { Currency } from "@/types/wallet";
import { formatCurrency } from "../utils/formatCurrency";
import { VitaButton } from "@/components/VitaButton";

import arrowLeftIcon from "@/assets/illustrations/arrow-left.png";

const { Text, Title } = Typography;

interface ExchangeSummaryProps {
  sourceCurrency: Currency;
  targetCurrency: Currency;
  amount: string;
  estimate: string;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0",
      }}
    >
      <Text
        style={{
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "19px",
          color: "var(--vw-black, #010E11)",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "22px",
          textAlign: "right",
          color: highlight
            ? "var(--vw-blue-1, #167287)"
            : "var(--vw-black, #010E11)",
        }}
      >
        {value}
      </Text>
    </div>
  );
}

function BackIconButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Volver"
      style={{
        width: 48,
        height: 48,
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src={arrowLeftIcon}
        alt=""
        style={{ width: 28, height: 28 }}
      />
    </button>
  );
}

export function ExchangeSummary({
  sourceCurrency,
  targetCurrency,
  amount,
  estimate,
  isSubmitting,
  onBack,
  onConfirm,
}: ExchangeSummaryProps) {
  const numericAmount = parseFloat(amount);
  const numericEstimate = parseFloat(estimate);
  const rateTargetToSource =
    Number.isFinite(numericEstimate) && numericEstimate > 0
      ? numericAmount / numericEstimate
      : 0;
  const rateLine = `1 ${targetCurrency} = ${formatCurrency(rateTargetToSource, sourceCurrency)}`;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 80,
          marginLeft: -64,
        }}
      >
        <BackIconButton onClick={onBack} disabled={isSubmitting} />
        <Title
          level={3}
          style={{
            margin: 0,
              color: "var(--vw-black, #010E11)",
            fontWeight: 600,
            fontSize: 28,
            lineHeight: "38px",
          }}
        >
          Resumen de transacción
        </Title>
      </div>

      <div
        style={{
          background: "#F9F9F9",
          borderRadius: 6,
          padding: "11px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <SummaryRow
          label="Monto a intercambiar"
          value={formatCurrency(amount, sourceCurrency)}
        />
        <SummaryRow label="Tasa de cambio" value={rateLine} />
        <SummaryRow
          label="Total a recibir"
          value={formatCurrency(estimate, targetCurrency)}
          highlight
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 48,
        }}
      >
        <div style={{ width: 183 }}>
          <VitaButton
            variant="secondary"
            block
            onClick={onBack}
            disabled={isSubmitting}
          >
            Atrás
          </VitaButton>
        </div>
        <div style={{ width: 183 }}>
          <VitaButton block loading={isSubmitting} onClick={onConfirm}>
            Intercambiar
          </VitaButton>
        </div>
      </div>
    </div>
  );
}
