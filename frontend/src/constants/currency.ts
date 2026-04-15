import type { Currency } from "@/types/wallet";

import bitcoinIcon from "@/assets/illustrations/bitcoin.png";
import usdcIcon from "@/assets/illustrations/usdc.png";
import tetherIcon from "@/assets/illustrations/tether.png";
import dollarIcon from "@/assets/illustrations/dollar-sign.png";
import chileIcon from "@/assets/illustrations/chile.png";

export const CURRENCY_ICONS: Record<Currency, string> = {
  USD: dollarIcon,
  CLP: chileIcon,
  BTC: bitcoinIcon,
  USDC: usdcIcon,
  USDT: tetherIcon,
};

/**
 * Human-readable names for each currency. Used in card titles and similar
 * surfaces. The dropdown selector keeps showing the short code (USD, CLP, …)
 * because that is what users recognise when picking a currency.
 */
export const CURRENCY_NAMES: Record<Currency, string> = {
  USD: "Dólar estadounidense",
  CLP: "Peso chileno",
  BTC: "Bitcoin",
  USDC: "USD Coin",
  USDT: "Tether",
};
