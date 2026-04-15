import { Input, type InputProps, type InputRef } from "antd";
import { forwardRef, useState } from "react";

import checkIcon from "@/assets/illustrations/check.png";
import eyeIcon from "@/assets/illustrations/eye.png";
import eyeOffIcon from "@/assets/illustrations/eye-off.png";

type TextFieldVariant = "default" | "amount";

interface VitaTextFieldProps {
  variant?: TextFieldVariant;
  label?: string;
  helperText?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  prefix?: React.ReactNode;
  type?: "text" | "password";
  error?: string;
  disabled?: boolean;
  inputProps?: Omit<InputProps, "value" | "onChange" | "placeholder" | "prefix" | "disabled">;
}

const INPUT_HEIGHT = 56;
const RADIUS = 6;
const BORDER_COLOR = "var(--vw-gray-1, #B9C1C2)";
const TEXT_COLOR = "var(--vw-black, #010E11)";
const PLACEHOLDER_COLOR = "var(--vw-gray-1, #B9C1C2)";
const ERROR_COLOR = "var(--vw-red, #CE3434)";

const inputStyle: React.CSSProperties = {
  height: INPUT_HEIGHT,
  borderRadius: RADIUS,
  borderColor: BORDER_COLOR,
  padding: 16,
  fontSize: 16,
  fontFamily: "'Open Sans', sans-serif",
  fontWeight: 400,
  lineHeight: "22px",
  color: TEXT_COLOR,
  background: "transparent",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Open Sans', sans-serif",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "19px",
  color: TEXT_COLOR,
  marginBottom: 4,
  display: "block",
};

const helperStyle: React.CSSProperties = {
  fontFamily: "'Open Sans', sans-serif",
  fontWeight: 400,
  fontSize: 12,
  lineHeight: "16px",
  color: TEXT_COLOR,
  textAlign: "right",
  marginTop: 4,
  display: "block",
};

const iconButton: React.CSSProperties = {
  cursor: "pointer",
  border: "none",
  background: "transparent",
  padding: 0,
  display: "flex",
  alignItems: "center",
};

function CheckSuffix() {
  return (
    <img
      src={checkIcon}
      alt=""
      style={{
        width: 18,
        height: 18,
        filter: "invert(62%) sepia(63%) saturate(1200%) hue-rotate(137deg) brightness(95%) contrast(96%)",
      }}
    />
  );
}

function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} style={iconButton} aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}>
      <img
        src={visible ? eyeIcon : eyeOffIcon}
        alt=""
        style={{ width: 20, height: 20 }}
      />
    </button>
  );
}

export const VitaTextField = forwardRef<InputRef, VitaTextFieldProps>(
  function VitaTextField(
    {
      variant = "default",
      label,
      helperText,
      placeholder,
      value,
      onChange,
      prefix,
      type = "text",
      error,
      disabled,
      inputProps,
    },
    ref,
  ) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const hasValue = value !== undefined && value !== "";
    const showCheck = type === "text" && hasValue && !error;
    const borderColor = error ? ERROR_COLOR : BORDER_COLOR;

    const mergedInputStyle: React.CSSProperties = {
      ...inputStyle,
      borderColor,
      ...(variant === "amount" ? { paddingLeft: prefix ? 48 : 16 } : {}),
    };

    const suffix = type === "password"
      ? <EyeToggle visible={passwordVisible} onToggle={() => setPasswordVisible((previous) => !previous)} />
      : showCheck
        ? <CheckSuffix />
        : undefined;

    const inputElement = (
      <Input
        ref={ref}
        type={type === "password" && !passwordVisible ? "password" : "text"}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        prefix={prefix}
        suffix={suffix}
        disabled={disabled}
        style={mergedInputStyle}
        styles={{
          input: {
            fontSize: 16,
            fontFamily: "'Open Sans', sans-serif",
            color: hasValue ? TEXT_COLOR : PLACEHOLDER_COLOR,
            background: "transparent",
          },
        }}
        {...inputProps}
      />
    );

    if (variant === "amount") {
      return inputElement;
    }

    return (
      <div>
        {label && <label style={labelStyle}>{label}</label>}
        {inputElement}
        {helperText && !hasValue && (
          <span style={{ ...helperStyle, color: error ? ERROR_COLOR : TEXT_COLOR }}>
            {error ?? helperText}
          </span>
        )}
        {error && hasValue && (
          <span style={{ ...helperStyle, color: ERROR_COLOR }}>{error}</span>
        )}
      </div>
    );
  },
);
