import { Select } from "antd";
import type { Currency } from "@/types/wallet";
import { CURRENCY_ICONS } from "@/constants/currency";

interface VitaSelectorProps {
  value?: Currency;
  onChange?: (currency: Currency) => void;
  currencies: readonly Currency[];
  placeholder?: string;
  disabled?: boolean;
}

const HEIGHT = 56;
const SELECTOR_WIDTH = 80;

function CurrencyIcon({ currency }: { currency: Currency }) {
  return (
    <img
      src={CURRENCY_ICONS[currency]}
      alt={currency}
      style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
    />
  );
}

function renderOption(currency: Currency) {
  return {
    value: currency,
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CurrencyIcon currency={currency} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{currency}</span>
      </div>
    ),
  };
}

function renderSelectedLabel(currency: Currency) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <CurrencyIcon currency={currency} />
    </div>
  );
}

export function VitaSelector({
  value,
  onChange,
  currencies,
  placeholder = "—",
  disabled,
}: VitaSelectorProps) {
  const options = currencies.map(renderOption);

  return (
    <Select<Currency>
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      labelRender={(props) => {
        const selectedCurrency = props.value as Currency | undefined;
        if (!selectedCurrency) return <span>{placeholder}</span>;
        return renderSelectedLabel(selectedCurrency);
      }}
      popupMatchSelectWidth={false}
      variant="outlined"
      className="vita-selector"
      style={{
        width: SELECTOR_WIDTH,
        height: HEIGHT,
      }}
    />
  );
}
