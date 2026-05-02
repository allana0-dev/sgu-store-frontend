"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type AddToCartInput,
  CART_STORAGE_KEY,
  type CartItem,
  getCartItemKey,
  getCurrentPrice,
} from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  addItem: (input: AddToCartInput, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const parseStoredItems = (value: string | null): CartItem[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") {
        return false;
      }

      const candidate = item as Partial<CartItem>;
      return (
        typeof candidate.key === "string" &&
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.subtitle === "string" &&
        typeof candidate.image === "string" &&
        typeof candidate.href === "string" &&
        !!candidate.pricing &&
        typeof candidate.pricing.currency === "string" &&
        typeof candidate.pricing.basePrice === "number" &&
        (typeof candidate.pricing.salePrice === "number" ||
          candidate.pricing.salePrice === null) &&
        (typeof candidate.pricing.compareAtPrice === "number" ||
          candidate.pricing.compareAtPrice === null) &&
        typeof candidate.quantity === "number" &&
        candidate.quantity > 0 &&
        !!candidate.variantSelection &&
        typeof candidate.variantSelection === "object"
      );
    });
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    setItems(parseStoredItems(stored));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((input: AddToCartInput, quantity = 1) => {
    setItems((previous) => {
      const safeQuantity = Math.max(1, Math.floor(quantity));
      const key = getCartItemKey(input.id, input.variantSelection);
      const existingIndex = previous.findIndex((item) => item.key === key);

      if (existingIndex === -1) {
        return [...previous, { ...input, key, quantity: safeQuantity }];
      }

      return previous.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: item.quantity + safeQuantity }
          : item,
      );
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((previous) => previous.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((previous) => {
      const safeQuantity = Math.floor(quantity);
      if (safeQuantity <= 0) {
        return previous.filter((item) => item.key !== key);
      }

      return previous.map((item) =>
        item.key === key ? { ...item, quantity: safeQuantity } : item,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsCartOpen((previous) => !previous);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + getCurrentPrice(item.pricing) * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      isCartOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      itemCount,
      subtotal,
      isCartOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
