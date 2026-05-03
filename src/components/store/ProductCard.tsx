import Image from "next/image";
import Link from "next/link";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiShoppingCart,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { useCart } from "@/components/cart/CartProvider";
import WishlistHeartButton from "@/components/wishlist/WishlistHeartButton";
import { getCartItemKey } from "@/lib/cart";
import type { ProductPricing, Product } from "./ProductDetailClient";

export type MinimalProduct = Pick<
  Product,
  | "id"
  | "name"
  | "subtitle"
  | "image"
  | "href"
  | "pricing"
  | "inventoryStatus"
  | "inventoryLabel"
>;

const formatPrice = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const getCurrentPrice = (pricing: ProductPricing) =>
  pricing.salePrice ?? pricing.basePrice;

const isDiscounted = (pricing: ProductPricing) => {
  const currentPrice = getCurrentPrice(pricing);
  return (
    pricing.compareAtPrice !== null && pricing.compareAtPrice > currentPrice
  );
};

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, updateQuantity, openCart } = useCart();
  const cartItemKey = getCartItemKey(product.id);
  const cartQuantity =
    items.find((item) => item.key === cartItemKey)?.quantity ?? 0;

  return (
    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col group h-full">
      <div className="relative mb-4">
        <Link href={product.href} className="block">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>
        <div className="absolute right-2 top-2 z-10">
          <WishlistHeartButton
            productId={product.id}
            productName={product.name}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:text-sgu-turquoise"
          />
        </div>
      </div>

      <div className="flex flex-col flex-1 px-1">
        <Link href={product.href}>
          <h3 className="text-[15px] font-bold text-sgu-navy line-clamp-2 mb-1 min-h-[2.6rem] leading-5">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mb-3 line-clamp-1">
          {product.subtitle}
        </p>

        <div className="mt-auto">
          {isDiscounted(product.pricing) ? (
            <div className="mb-0.5 flex items-center gap-2">
              <p className="text-xs font-semibold text-slate-400 line-through">
                {formatPrice(
                  product.pricing.compareAtPrice as number,
                  product.pricing.currency,
                )}
              </p>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                Sale
              </span>
            </div>
          ) : null}
          <p className="text-xl font-black text-sgu-navy mb-1">
            {formatPrice(
              getCurrentPrice(product.pricing),
              product.pricing.currency,
            )}
          </p>
          <div
            className={`mb-3 flex items-center gap-1.5 text-xs font-semibold ${
              product.inventoryStatus === "low_stock"
                ? "text-amber-600"
                : "text-emerald-600"
            }`}
          >
            {product.inventoryStatus === "low_stock" ? (
              <FiAlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <FiCheckCircle className="h-3.5 w-3.5" />
            )}
            <span>{product.inventoryLabel}</span>
          </div>
          {cartQuantity > 0 ? (
            <div className="flex h-10 items-center overflow-hidden rounded-lg border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => updateQuantity(cartItemKey, cartQuantity - 1)}
                className="inline-flex h-full w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50"
                aria-label={`Decrease quantity for ${product.name}`}
              >
                <FiMinus className="h-4 w-4" />
              </button>
              <div className="flex h-full flex-1 items-center justify-center border-x border-slate-200 text-sm font-bold text-sgu-navy">
                {cartQuantity} in cart
              </div>
              <button
                type="button"
                onClick={() => updateQuantity(cartItemKey, cartQuantity + 1)}
                className="inline-flex h-full w-10 items-center justify-center text-slate-600 transition-colors hover:bg-slate-50"
                aria-label={`Increase quantity for ${product.name}`}
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                addItem({
                  id: product.id,
                  name: product.name,
                  subtitle: product.subtitle,
                  image: product.image,
                  href: product.href,
                  pricing: product.pricing,
                  variantSelection: {},
                });
                openCart();
              }}
              className="w-full rounded-lg bg-sgu-navy px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-sgu-turquoise"
            >
              <span className="inline-flex items-center gap-2">
                <FiShoppingCart className="h-4 w-4" />
                Add to Cart
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
