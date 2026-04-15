import { Input, type InputProps, type InputRef } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { forwardRef } from "react";

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
const CHECK_COLOR = "var(--vw-blue-2, #05BCB9)";
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
    const hasValue = value !== undefined && value !== "";
    const showCheck = hasValue && !error;
    const borderColor = error ? ERROR_COLOR : BORDER_COLOR;

    const suffix = showCheck ? (
      <CheckCircleFilled style={{ color: CHECK_COLOR, fontSize: 18 }} />
    ) : undefined;

    const mergedInputStyle: React.CSSProperties = {
      ...inputStyle,
      borderColor,
      ...(variant === "amount" ? { paddingLeft: prefix ? 48 : 16 } : {}),
    };

    const InputComponent = type === "password" ? Input.Password : Input;

    const inputElement = (
      <InputComponent
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        prefix={prefix}
        suffix={type === "text" ? suffix : undefined}
        disabled={disabled}
        style={mergedInputStyle}
        styles={{
          input: {
            fontSize: 16,
            fontFamily: "'Open Sans', sans-serif",
            color: hasValue ? TEXT_COLOR : PLACEHOLDER_COLOR,
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
