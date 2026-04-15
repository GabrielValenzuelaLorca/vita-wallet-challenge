import { Button as AntButton, type ButtonProps as AntButtonProps } from "antd";

type VitaVariant = "primary" | "secondary";
type VitaSize = "full" | "compact";

interface VitaButtonProps {
  variant?: VitaVariant;
  vitaSize?: VitaSize;
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  htmlType?: AntButtonProps["htmlType"];
  block?: boolean;
  icon?: React.ReactNode;
}

const HEIGHT = 54;
const RADIUS = 6;
const FONT_SIZE = 16;
const FONT_WEIGHT = 600;
const PADDING_VERTICAL = 16;
const PADDING_HORIZONTAL = 12;

const PRIMARY_GRADIENT = "linear-gradient(90deg, #05BCB9 0%, #167287 100%)";
const DISABLED_BG = "var(--vw-gray-2, #DEE0E0)";
const TEXT_WHITE = "var(--vw-white, #F9F9FA)";
const TEXT_BLUE1 = "var(--vw-blue-1, #167287)";

function getStyles(
  variant: VitaVariant,
  vitaSize: VitaSize,
  disabled: boolean,
  loading: boolean,
): React.CSSProperties {
  const base: React.CSSProperties = {
    height: HEIGHT,
    borderRadius: RADIUS,
    padding: `${PADDING_VERTICAL}px ${PADDING_HORIZONTAL}px`,
    fontSize: FONT_SIZE,
    fontWeight: FONT_WEIGHT,
    lineHeight: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "opacity 0.2s",
  };

  if (vitaSize === "compact") {
    base.minWidth = 160;
  }

  if (variant === "primary") {
    if (disabled || loading) {
      return {
        ...base,
        background: DISABLED_BG,
        color: TEXT_WHITE,
        border: "none",
      };
    }
    return {
      ...base,
      background: PRIMARY_GRADIENT,
      color: TEXT_WHITE,
      border: "none",
    };
  }

  // secondary — gradient border using background-clip technique
  return {
    ...base,
    background: `
      linear-gradient(#ffffff, #ffffff) padding-box,
      ${PRIMARY_GRADIENT} border-box
    `,
    color: TEXT_BLUE1,
    border: "1px solid transparent",
  };
}

export function VitaButton({
  variant = "primary",
  vitaSize = "full",
  children,
  onClick,
  loading = false,
  disabled = false,
  htmlType,
  block,
  icon,
}: VitaButtonProps) {
  const style = getStyles(variant, vitaSize, disabled, loading);

  return (
    <AntButton
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      htmlType={htmlType}
      block={block}
      icon={icon}
      style={style}
    >
      {children}
    </AntButton>
  );
}
