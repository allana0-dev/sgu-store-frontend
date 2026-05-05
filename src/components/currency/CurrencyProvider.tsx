"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CURRENCIES,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  type SupportedCurrencyCode,
  convertCurrencyAmount,
  formatCurrencyAmount,
  normalizeCurrencyCode,
} from "@/lib/currency";

type CurrencyContextValue = {
  selectedCurrencyCode: SupportedCurrencyCode;
  setSelectedCurrencyCode: (code: SupportedCurrencyCode) => void;
  convertPrice: (amount: number, sourceCurrency?: string) => number;
  formatPrice: (amount: number, sourceCurrency?: string) => string;
  formatSelectedAmount: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrencyCode, setSelectedCurrencyCode] =
    useState<SupportedCurrencyCode>(DEFAULT_CURRENCY);

  useEffect(() => {
    const storedCode = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    const code = normalizeCurrencyCode(storedCode ?? undefined);
    if (code !== DEFAULT_CURRENCY) {
      setSelectedCurrencyCode(code);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CURRENCY_STORAGE_KEY, selectedCurrencyCode);
  }, [selectedCurrencyCode]);

  const value = useMemo<CurrencyContextValue>(() => {
    const convertPrice = (amount: number, sourceCurrency = "USD") =>
      convertCurrencyAmount(amount, sourceCurrency, selectedCurrencyCode);

    const formatPrice = (amount: number, sourceCurrency = "USD") =>
      formatCurrencyAmount(
        convertCurrencyAmount(amount, sourceCurrency, selectedCurrencyCode),
        selectedCurrencyCode,
      );

    const formatSelectedAmount = (amount: number) =>
      formatCurrencyAmount(amount, selectedCurrencyCode);

    return {
      selectedCurrencyCode,
      setSelectedCurrencyCode,
      convertPrice,
      formatPrice,
      formatSelectedAmount,
    };
  }, [selectedCurrencyCode]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used inside CurrencyProvider.");
  }

  return context;
}

export { CURRENCIES };
