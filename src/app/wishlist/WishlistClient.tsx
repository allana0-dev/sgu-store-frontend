"use client";

import Link from "next/link";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useWishlist } from "@/components/wishlist/WishlistProvider";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/components/store/ProductDetailClient";

type WishlistClientProps = {
  products: Product[];
};

export default function WishlistClient({ products }: WishlistClientProps) {
  const { productIds, isReady, isAuthenticated } = useWishlist();
  const wishlistedProducts = products.filter((product) =>
    productIds.includes(product.id),
  );

  if (!isReady) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card-surface p-8 md:p-12">
          <p className="text-sm font-semibold text-sgu-gray">
            Loading your wishlist...
          </p>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="card-surface p-8 text-center md:p-12">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-sgu-red">
            <FiHeart className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-bold text-sgu-navy">
            Your Wishlist
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sgu-gray">
            Log in to view the SGU Campus Store items you&apos;ve saved for
            later.
          </p>
          <Link
            href="/account"
            className="button-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm"
          >
            Log in to your account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-sgu-turquoise">
            Saved items
          </p>
          <h1 className="mt-3 text-3xl font-bold text-sgu-navy">
            Your Wishlist
          </h1>
          <p className="mt-3 max-w-2xl text-sgu-gray">
            Keep track of SGU Campus Store products you want to revisit later.
          </p>
        </div>
        <Link
          href="/store"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-sgu-navy px-5 py-3 text-sm font-bold text-sgu-navy transition-colors hover:bg-sgu-navy hover:text-white"
        >
          <FiShoppingBag className="h-4 w-4" aria-hidden="true" />
          Continue shopping
        </Link>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="card-surface p-8 text-center md:p-12">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-sgu-navy">
            <FiHeart className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-sgu-navy">
            No saved items yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sgu-gray">
            Tap the heart on any product to add it to your wishlist.
          </p>
          <Link
            href="/store"
            className="button-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm"
          >
            Browse products
          </Link>
        </div>
      )}
    </section>
  );
}
