"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiHeart,
  FiCheck,
  FiChevronRight,
} from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useCart } from "@/components/cart/CartProvider";
import { getCartItemKey } from "@/lib/cart";

export type ProductPricing = {
  currency: string;
  basePrice: number;
  salePrice: number | null;
  compareAtPrice: number | null;
};

export type ProductVariant = {
  label: string;
  options: string[];
};

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  images: string[];
  image: string;
  href: string;
  pricing: ProductPricing;
  inventoryStatus: "in_stock" | "low_stock" | "out_of_stock";
  inventoryLabel: string;
  department?: string;
  tags?: string[];
  gender?: string;
  dietary?: string[] | null;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[] | null;
};

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

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex text-sgu-orange text-sm">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} />
        ))}
        {hasHalfStar && <FaStarHalfAlt />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500">({count} Reviews)</span>
      )}
    </div>
  );
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { items, addItem, updateQuantity, openCart } = useCart();
  const [activeImage, setActiveImage] = useState(product.image);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [activeTab, setActiveTab] = useState<"reviews" | "description">(
    "reviews",
  );
  const cartItemKey = getCartItemKey(product.id, selectedVariants);
  const cartQuantity =
    items.find((item) => item.key === cartItemKey)?.quantity ?? 0;

  const handleVariantSelect = (label: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [label]: option }));
  };

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        image: product.image,
        href: product.href,
        pricing: product.pricing,
        variantSelection: selectedVariants,
      },
      quantity,
    );
    openCart();
  };

  // Mock reviews for demo
  const mockReviews = [
    {
      id: 1,
      user: "Emily Chen",
      rating: 5,
      date: "1 month ago",
      text: "Always fresh and perfect condition. Highly recommend for studying!",
      verified: true,
    },
    {
      id: 2,
      user: "James Wilson",
      rating: 5,
      date: "1 month ago",
      text: "Top quality product. Exactly what I needed for the semester.",
      verified: true,
    },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-sgu-navy transition-colors">
          Home
        </Link>
        <FiChevronRight className="mx-2 w-3 h-3" />
        <Link href="/store" className="hover:text-sgu-navy transition-colors">
          Shop
        </Link>
        {product.department && (
          <>
            <FiChevronRight className="mx-2 w-3 h-3" />
            <Link
              href={`/store?dept=${encodeURIComponent(product.department)}`}
              className="hover:text-sgu-navy transition-colors"
            >
              {product.department}
            </Link>
          </>
        )}
        <FiChevronRight className="mx-2 w-3 h-3" />
        <span className="text-sgu-navy truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Top Section: Images & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
        {/* Left: Images */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-sm flex items-center justify-center p-8">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              className="object-contain object-center p-4 mix-blend-multiply"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <button className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:text-sgu-red transition-colors text-sgu-gray border border-slate-100">
              <FiHeart className="w-5 h-5" />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-24 h-24 rounded-2xl bg-white border shrink-0 overflow-hidden flex items-center justify-center transition-all ${
                    activeImage === img
                      ? "border-sgu-turquoise ring-1 ring-sgu-turquoise/20"
                      : "border-slate-100 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    fill
                    className="object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            {product.department && (
              <span className="text-sm font-bold text-sgu-turquoise uppercase tracking-wider">
                {product.department}
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl lg:text-4xl font-black text-sgu-navy leading-tight">
              {product.name}
            </h1>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                product.inventoryStatus === "in_stock"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {product.inventoryLabel}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {product.rating !== undefined && (
              <>
                <StarRating
                  rating={product.rating}
                  count={product.reviewCount}
                />
                <span className="text-slate-300">|</span>
              </>
            )}

            {/* Tags / Metadata */}
            <div className="flex flex-wrap items-center gap-2">
              {product.dietary?.map((d) => (
                <span
                  key={d}
                  className="px-2 py-0.5 bg-sgu-light-turquoise/20 text-sgu-turquoise text-xs font-bold rounded-md"
                >
                  {d}
                </span>
              ))}
              {product.gender && product.gender !== "unisex" && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-md capitalize">
                  {product.gender}
                </span>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-end gap-3 mb-6">
            {isDiscounted(product.pricing) ? (
              <>
                <span className="text-3xl font-black text-sgu-navy">
                  {formatPrice(
                    getCurrentPrice(product.pricing),
                    product.pricing.currency,
                  )}
                </span>
                <span className="text-xl font-bold text-slate-400 line-through mb-1">
                  {formatPrice(
                    product.pricing.compareAtPrice as number,
                    product.pricing.currency,
                  )}
                </span>
                <span className="bg-red-50 text-red-600 text-xs font-black uppercase px-2 py-1 rounded-md mb-1 ml-2">
                  Sale
                </span>
              </>
            ) : (
              <span className="text-3xl font-black text-sgu-navy">
                {formatPrice(
                  getCurrentPrice(product.pricing),
                  product.pricing.currency,
                )}
              </span>
            )}
          </div>

          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            {product.description}
          </p>

          <hr className="border-slate-100 mb-8" />

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-col gap-6 mb-8">
              {product.variants.map((variant) => (
                <div key={variant.label}>
                  <p className="text-sm font-bold text-sgu-navy mb-3">
                    {variant.label}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {variant.options.map((opt) => {
                      const isSelected =
                        selectedVariants[variant.label] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() =>
                            handleVariantSelect(variant.label, opt)
                          }
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                            isSelected
                              ? "border-sgu-navy bg-sgu-navy text-white shadow-md"
                              : "border-slate-200 bg-white text-sgu-gray hover:border-sgu-navy/30"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 mt-auto">
            {/* Quantity */}
            <div className="flex items-center h-14 bg-white border border-slate-200 rounded-xl overflow-hidden shrink-0">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-sgu-navy transition-colors"
              >
                <FiMinus className="w-4 h-4" />
              </button>
              <div className="w-12 h-full flex items-center justify-center font-bold text-sgu-navy border-x border-slate-100">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-sgu-navy transition-colors"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Buttons */}
            {cartQuantity > 0 ? (
              <div className="flex h-14 flex-1 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => updateQuantity(cartItemKey, cartQuantity - 1)}
                  className="inline-flex h-full w-14 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-sgu-navy"
                  aria-label={`Decrease quantity for ${product.name}`}
                >
                  <FiMinus className="h-5 w-5" />
                </button>
                <div className="flex h-full flex-1 items-center justify-center border-x border-slate-100 text-sm font-black text-sgu-navy">
                  {cartQuantity} in cart
                </div>
                <button
                  type="button"
                  onClick={() => updateQuantity(cartItemKey, cartQuantity + 1)}
                  className="inline-flex h-full w-14 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-sgu-navy"
                  aria-label={`Increase quantity for ${product.name}`}
                >
                  <FiPlus className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-14 bg-sgu-navy hover:bg-sgu-navy/90 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-sgu-navy/20"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add to cart
              </button>
            )}
            <button className="flex-1 h-14 bg-sgu-orange hover:bg-[#e65a00] text-white rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-sgu-orange/20">
              Buy now
            </button>
          </div>

          {/* Extra generic details underneath */}
          <div className="mt-8 flex flex-col gap-2 text-sm text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p>
              <span className="font-semibold text-sgu-navy">Free delivery</span>{" "}
              on campus for orders bought through online payment
            </p>
            <p>
              <span className="font-semibold text-sgu-navy">
                Return Policy:
              </span>{" "}
              30 days return or exchange.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tabs */}
      <div className="mt-16 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-8 border-b border-slate-100 mb-8">
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 text-lg font-bold transition-colors relative ${
              activeTab === "reviews"
                ? "text-sgu-navy"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Rating & Reviews
            {activeTab === "reviews" && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-sgu-turquoise rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 text-lg font-bold transition-colors relative ${
              activeTab === "description"
                ? "text-sgu-navy"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Description
            {activeTab === "description" && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-sgu-turquoise rounded-t-full" />
            )}
          </button>
        </div>

        {activeTab === "reviews" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Reviews Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-black text-sgu-navy">
                  {product.rating || "0.0"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-500 mb-1">
                    out of 5
                  </span>
                  <StarRating rating={product.rating || 0} />
                </div>
              </div>

              {/* Star Bars */}
              <div className="flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percent =
                    star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 10 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-10 text-slate-500 font-semibold">
                        {star} Star
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sgu-orange rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 p-6 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <h4 className="font-bold text-sgu-navy mb-2">
                  Review this product
                </h4>
                <p className="text-sm text-slate-500 mb-4">
                  Share your thoughts with other customers
                </p>
                <button className="w-full py-3 rounded-xl border-2 border-sgu-navy text-sgu-navy font-bold hover:bg-sgu-navy hover:text-white transition-colors">
                  Write a customer review
                </button>
              </div>
            </div>

            {/* Review List */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sgu-navy">Review List</h4>
                <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white outline-none focus:ring-2 ring-sgu-turquoise/20">
                  <option>Sort by: Newest</option>
                  <option>Sort by: Highest Rating</option>
                </select>
              </div>

              {mockReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col gap-3 pb-6 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-sgu-turquoise/10 text-sgu-turquoise flex items-center justify-center font-bold text-sm">
                        {review.user.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sgu-navy text-sm flex items-center gap-1">
                          {review.user}
                          {review.verified && (
                            <FiCheck
                              className="w-3 h-3 text-emerald-500"
                              title="Verified Buyer"
                            />
                          )}
                        </span>
                        <span className="text-xs text-slate-400">
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "description" && (
          <div className="prose prose-slate max-w-none text-slate-600">
            <p className="text-lg leading-relaxed">{product.description}</p>
            {product.tags && (
              <div className="mt-8 flex flex-wrap gap-2">
                <span className="font-bold text-sgu-navy mr-2">Tags:</span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold capitalize text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* You might also like */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h3 className="text-2xl font-black text-sgu-navy mb-8">
            You might also like
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((rp) => (
              <Link
                href={rp.href}
                key={rp.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 p-4 hover:border-sgu-turquoise transition-all hover:shadow-lg"
              >
                <div className="relative aspect-square w-full rounded-xl bg-slate-50 mb-4 overflow-hidden">
                  <Image
                    src={rp.image}
                    alt={rp.name}
                    fill
                    className="object-contain p-4 group-hover:scale-105 transition-transform"
                  />
                </div>
                <h4 className="font-bold text-sgu-navy text-sm line-clamp-2 mb-1 min-h-[2.5rem] leading-tight">
                  {rp.name}
                </h4>
                <div className="mt-auto pt-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg text-sgu-navy">
                      {formatPrice(
                        getCurrentPrice(rp.pricing),
                        rp.pricing.currency,
                      )}
                    </span>
                    {isDiscounted(rp.pricing) && (
                      <span className="text-xs font-bold text-slate-400 line-through">
                        {formatPrice(
                          rp.pricing.compareAtPrice as number,
                          rp.pricing.currency,
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
