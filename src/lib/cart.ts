export type CartPricing = {
  currency: string;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
};

export type CartItem = {
  key: string;
  id: string;
  name: string;
  subtitle: string;
  image: string;
  href: string;
  pricing: CartPricing;
  quantity: number;
  variantSelection: Record<string, string>;
};

export type AddToCartInput = Omit<CartItem, "key" | "quantity">;

export const CART_STORAGE_KEY = "sgu-cart-items";

export const getCurrentPrice = (pricing: CartPricing) =>
  pricing.salePrice ?? pricing.basePrice;

export const getCartItemKey = (
  id: string,
  variantSelection: Record<string, string> = {},
) => {
  const normalizedVariants = Object.entries(variantSelection)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => `${label}:${value}`)
    .join("|");

  return normalizedVariants ? `${id}::${normalizedVariants}` : id;
};

export const getVariantSummary = (
  variantSelection: Record<string, string> = {},
) =>
  Object.entries(variantSelection)
    .map(([label, value]) => `${label}: ${value}`)
    .join(" • ");
