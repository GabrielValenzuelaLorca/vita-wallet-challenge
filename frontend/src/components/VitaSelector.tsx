import { Select } from "antd";
import type { Currency } from "@/types/wallet";

import bitcoinIcon from "@/assets/illustrations/bitcoin.png";
import usdcIcon from "@/assets/illustrations/usdc.png";
import tetherIcon from "@/assets/illustrations/tether.png";
import dollarIcon from "@/assets/illustrations/dollar-sign.png";
import chileIcon from "@/assets/illustrations/chile.png";

interface VitaSelectorProps {
  value?: Currency;
  onChange?: (currency: Currency) => void;
  currencies: readonly Currency[];
  placeholder?: string;
  disabled?: boolean;
}

const CURRENCY_ICONS: Record<Currency, string> = {
  USD: dollarIcon,
  CLP: chileIcon,
  BTC: bitcoinIcon,
  USDC: usdcIcon,
  USDT: tetherIcon,
};

const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "USD",
  CLP: "CLP",
  BTC: "BTC",
  USDC: "USDC",
  USDT: "USDT",
};

const HEIGHT = 56;
const SELECTOR_WIDTH = 80;

function CurrencyIcon({ currency }: { currency: Currency }) {
  return (
    <img
      src={CURRENCY_ICONS[currency]}
      alt={CURRENCY_LABELS[currency]}
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
        <span style={{ fontSize: 14, fontWeight: 500 }}>
          {CURRENCY_LABELS[currency]}
        </span>
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
