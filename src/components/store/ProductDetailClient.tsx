"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiChevronRight,
} from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useCart } from "@/components/cart/CartProvider";
import WishlistHeartButton from "@/components/wishlist/WishlistHeartButton";
import { getCartItemKey } from "@/lib/cart";
import {
  createProductReview,
  getProductReviews,
  type ProductReview,
} from "@/lib/reviews";

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
  category?: string;
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
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewDisplayName, setReviewDisplayName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
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

  useEffect(() => {
    let isMounted = true;

    getProductReviews(product.id)
      .then((productReviews) => {
        if (isMounted) {
          setReviews(productReviews);
          setReviewsError("");
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          setReviewsError(error.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewSubmitError("");
    setReviewSubmitSuccess("");
    setIsSubmittingReview(true);

    try {
      const review = await createProductReview(product.id, {
        displayName: reviewDisplayName,
        rating: reviewRating,
        title: reviewTitle || undefined,
        body: reviewBody,
      });

      setReviews((currentReviews) => [review, ...currentReviews]);
      setReviewDisplayName("");
      setReviewRating(5);
      setReviewTitle("");
      setReviewBody("");
      setReviewFormOpen(false);
      setReviewSubmitSuccess("Thanks! Your review has been posted.");
    } catch (error) {
      setReviewSubmitError(
        error instanceof Error
          ? error.message
          : "We couldn't post your review right now.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const hasRatings =
    reviews.length > 0 ||
    (product.rating !== undefined &&
      product.rating !== null &&
      (product.reviewCount ?? 0) > 0);
  const displayedReviewCount = reviews.length || product.reviewCount || 0;
  const displayedRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((total, review) => total + review.rating, 0) /
            reviews.length +
            Number.EPSILON) *
            10,
        ) / 10
      : product.rating;

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
            <div className="absolute top-4 right-4 z-10">
              <WishlistHeartButton
                productId={product.id}
                productName={product.name}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-white/85 text-sgu-gray shadow-sm backdrop-blur-md transition-colors hover:text-sgu-red"
                iconClassName="h-5 w-5"
              />
            </div>
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
            {hasRatings && (
              <>
                <StarRating
                  rating={displayedRating as number}
                  count={displayedReviewCount}
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
              {hasRatings ? (
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-black text-sgu-navy">
                    {displayedRating}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-500 mb-1">
                      out of 5
                    </span>
                    <StarRating rating={displayedRating as number} />
                    <span className="mt-1 text-xs text-slate-500">
                      {displayedReviewCount} customer reviews
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <h4 className="font-bold text-sgu-navy mb-2">
                    No ratings yet
                  </h4>
                  <p className="text-sm text-slate-500">
                    This product has not received customer ratings yet.
                  </p>
                </div>
              )}

              <div className="mt-4 p-6 bg-slate-50 rounded-2xl text-center border border-slate-100">
                <h4 className="font-bold text-sgu-navy mb-2">
                  Review this product
                </h4>
                <p className="text-sm text-slate-500 mb-4">
                  Share your thoughts with other customers
                </p>
                <button
                  type="button"
                  onClick={() => setReviewFormOpen((isOpen) => !isOpen)}
                  className="w-full py-3 rounded-xl border-2 border-sgu-navy text-sgu-navy font-bold hover:bg-sgu-navy hover:text-white transition-colors"
                >
                  {reviewFormOpen
                    ? "Close review form"
                    : "Write a customer review"}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sgu-navy">Review List</h4>
              </div>

              {reviewSubmitSuccess && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                  {reviewSubmitSuccess}
                </div>
              )}

              {reviewsError && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                  {reviewsError}
                </div>
              )}

              {reviewFormOpen && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-bold text-sgu-navy">
                      Display name
                      <input
                        value={reviewDisplayName}
                        onChange={(event) =>
                          setReviewDisplayName(event.target.value)
                        }
                        required
                        maxLength={80}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-sgu-turquoise"
                        placeholder="Your name"
                      />
                    </label>

                    <label className="flex flex-col gap-2 text-sm font-bold text-sgu-navy">
                      Rating
                      <select
                        value={reviewRating}
                        onChange={(event) =>
                          setReviewRating(Number(event.target.value))
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-sgu-turquoise"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} star{rating === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="flex flex-col gap-2 text-sm font-bold text-sgu-navy">
                    Review title
                    <input
                      value={reviewTitle}
                      onChange={(event) => setReviewTitle(event.target.value)}
                      maxLength={120}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-sgu-turquoise"
                      placeholder="Optional headline"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm font-bold text-sgu-navy">
                    Review
                    <textarea
                      value={reviewBody}
                      onChange={(event) => setReviewBody(event.target.value)}
                      required
                      minLength={10}
                      maxLength={1000}
                      rows={5}
                      className="resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-sgu-turquoise"
                      placeholder="Tell other customers what you thought."
                    />
                  </label>

                  {reviewSubmitError && (
                    <p className="text-sm font-semibold text-red-600">
                      {reviewSubmitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="inline-flex items-center justify-center rounded-xl bg-sgu-navy px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-sgu-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingReview ? "Posting review..." : "Post review"}
                  </button>
                </form>
              )}

              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h5 className="font-bold text-sgu-navy">
                          {review.title || "Customer review"}
                        </h5>
                        <p className="text-xs font-semibold text-slate-500">
                          By {review.displayName}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {review.body}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <h5 className="font-bold text-sgu-navy">
                    No written reviews yet
                  </h5>
                  <p className="mt-2 text-sm text-slate-500">
                    Be the first customer to share your thoughts.
                  </p>
                </div>
              )}
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
                <h4 className="font-bold text-sgu-navy text-sm line-clamp-2 mb-1 min-h-10 leading-tight">
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
