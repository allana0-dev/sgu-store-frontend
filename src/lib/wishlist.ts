export const WISHLIST_STORAGE_KEY = "sgu-wishlist-by-user";

export type WishlistByUser = Record<string, string[]>;

export const parseStoredWishlist = (value: string | null): WishlistByUser => {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const normalized: WishlistByUser = {};
    for (const [userId, productIds] of Object.entries(parsed)) {
      if (!Array.isArray(productIds)) {
        continue;
      }

      const safeProductIds = productIds.filter(
        (productId): productId is string => typeof productId === "string",
      );
      normalized[userId] = Array.from(new Set(safeProductIds));
    }

    return normalized;
  } catch {
    return {};
  }
};
