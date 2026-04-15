import { Select } from "antd";

interface VitaSelectOption<T extends string | number> {
  label: string;
  value: T;
}

interface VitaSelectProps<T extends string | number = string> {
  options: VitaSelectOption<T>[];
  value?: T;
  /**
   * Called when the user picks an option. When `allowClear` is true and the
   * user clears the selection, antd dispatches `undefined` so the signature
   * must include it.
   */
  onChange?: (value: T | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const HEIGHT = 44;

export function VitaSelect<T extends string | number = string>({
  options,
  value,
  onChange,
  placeholder,
  allowClear,
  disabled,
  style,
}: VitaSelectProps<T>) {
  return (
    <Select<T>
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      style={{
        height: HEIGHT,
        ...style,
      }}
    />
  );
}
