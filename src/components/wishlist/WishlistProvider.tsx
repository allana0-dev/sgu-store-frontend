"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  parseStoredWishlist,
  type WishlistByUser,
  WISHLIST_STORAGE_KEY,
} from "@/lib/wishlist";

type WishlistContextValue = {
  productIds: string[];
  isReady: boolean;
  isAuthenticated: boolean;
  hasProduct: (productId: string) => boolean;
  toggleProduct: (productId: string) => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [wishlistByUser, setWishlistByUser] = useState<WishlistByUser>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    return parseStoredWishlist(window.localStorage.getItem(WISHLIST_STORAGE_KEY));
  });

  const productIds = useMemo(
    () => (user ? wishlistByUser[String(user.id)] ?? [] : []),
    [user, wishlistByUser],
  );

  const hasProduct = useCallback(
    (productId: string) => productIds.includes(productId),
    [productIds],
  );

  const toggleProduct = useCallback(
    (productId: string) => {
      if (!user) {
        return;
      }

      const userId = String(user.id);
      setWishlistByUser((previous) => {
        const current = previous[userId] ?? [];
        const exists = current.includes(productId);
        const next = exists
          ? current.filter((id) => id !== productId)
          : [...current, productId];
        const nextMap = { ...previous, [userId]: next };
        window.localStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(nextMap),
        );
        return nextMap;
      });
    },
    [user],
  );

  const value = useMemo(
    () => ({
      productIds,
      isReady: !isLoading,
      isAuthenticated: !!user,
      hasProduct,
      toggleProduct,
    }),
    [productIds, isLoading, user, hasProduct, toggleProduct],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return context;
}
