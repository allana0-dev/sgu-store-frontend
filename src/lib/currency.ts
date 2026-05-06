export const CURRENCY_STORAGE_KEY = "sgu-selected-currency";
export const USD_TO_XCD_RATE = 2.7;

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "XCD", symbol: "EC$", label: "East Caribbean Dollar" },
] as const;

export type SupportedCurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: SupportedCurrencyCode = "XCD";

const SUPPORTED_CURRENCY_CODES = new Set<SupportedCurrencyCode>(
  CURRENCIES.map((currency) => currency.code),
);

export function isSupportedCurrencyCode(
  code: string,
): code is SupportedCurrencyCode {
  return SUPPORTED_CURRENCY_CODES.has(code as SupportedCurrencyCode);
}

export function normalizeCurrencyCode(code?: string): SupportedCurrencyCode {
  if (code && isSupportedCurrencyCode(code)) {
    return code;
  }

  return DEFAULT_CURRENCY;
}

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: SupportedCurrencyCode,
) {
  const from = normalizeCurrencyCode(fromCurrency);

  if (from === toCurrency) {
    return amount;
  }

  if (from === "USD" && toCurrency === "XCD") {
    return amount * USD_TO_XCD_RATE;
  }

  if (from === "XCD" && toCurrency === "USD") {
    return amount / USD_TO_XCD_RATE;
  }

  return amount;
}

export function formatCurrencyAmount(
  amount: number,
  currency: SupportedCurrencyCode,
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
