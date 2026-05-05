"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiSearch } from "react-icons/fi";
import { useCurrency } from "@/components/currency/CurrencyProvider";
import {
  searchLocalProducts,
  searchProducts,
  type BackendProduct,
} from "@/lib/products";
import type { Product } from "@/components/store/ProductDetailClient";
import homePopularProductsData from "@/data/home-popular-products.json";

const getProductHref = (id: string) => `/store/${id}`;

const localProducts = homePopularProductsData as Product[];

const getDisplayPrice = (product: BackendProduct) =>
  product.pricing.salePrice ?? product.pricing.basePrice;

const isInStock = (product: BackendProduct) =>
  product.inventoryStatus !== "out_of_stock";

const mergeProducts = <T extends BackendProduct>(
  primaryProducts: T[],
  secondaryProducts: T[],
) => {
  const productMap = new Map<string, T>();

  for (const product of [...primaryProducts, ...secondaryProducts]) {
    if (!productMap.has(product.id)) {
      productMap.set(product.id, product);
    }
  }

  return Array.from(productMap.values());
};

function ProductResultCard({
  product,
  formatPrice,
}: {
  product: BackendProduct;
  formatPrice: (amount: number, sourceCurrency?: string) => string;
}) {
  return (
    <Link
      href={getProductHref(product.id)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-slate-300">
            SGU Store
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-sgu-turquoise">
          {product.category || "Campus Essential"}
        </p>
        <h3 className="line-clamp-2 text-base font-black text-sgu-navy">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {product.description || "Explore this SGU store item."}
        </p>
        <div className="mt-auto pt-4">
          <p className="text-xl font-black text-sgu-navy">
            {formatPrice(getDisplayPrice(product), product.pricing.currency)}
          </p>
          <p
            className={`mt-1 inline-flex items-center gap-1.5 text-xs font-bold ${
              isInStock(product) ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            <FiCheckCircle className="h-3.5 w-3.5" />
            {isInStock(product) ? `${product.inventory} in stock` : "Out of stock"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function SearchClient({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const { formatPrice } = useCurrency();
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [results, setResults] = useState<BackendProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const trimmedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!trimmedQuery) {
      return;
    }

    let isActive = true;

    queueMicrotask(() => {
      if (isActive) {
        setIsSearching(true);
        setSearchError(null);
      }
    });

    const localMatches = searchLocalProducts(
      localProducts,
      trimmedQuery,
      12,
      onlyInStock,
    );

    searchProducts(trimmedQuery, 12, onlyInStock)
      .then((products) => {
        if (isActive) {
          setResults(mergeProducts(products, localMatches).slice(0, 12));
        }
      })
      .catch((error: Error) => {
        if (isActive) {
          setResults(localMatches);
          setSearchError(
            localMatches.length > 0
              ? null
              : `${error.message} Showing no local matches either.`,
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsSearching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [onlyInStock, trimmedQuery]);

  return (
    <section className="bg-surface py-8 md:py-12">
      <div className="container-shell flex flex-col gap-8">
        <div className="card-surface p-6 md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-sgu-turquoise">
              Shop Search
            </p>
            <h1 className="mt-3 text-3xl font-black text-sgu-navy md:text-4xl">
              Find SGU essentials faster
            </h1>
            <p className="mt-3 text-sgu-gray">
              Search backend inventory and local catalog items in one place.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-sgu-navy">
                Product results
              </h2>
              <p className="text-sm text-slate-500">
                Search checks backend inventory and local catalog items.
              </p>
            </div>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-sgu-navy">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(event) => setOnlyInStock(event.target.checked)}
                className="h-4 w-4 accent-sgu-turquoise"
              />
              In stock only
            </label>
          </div>

          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search textbooks, apparel, snacks..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm font-medium text-sgu-navy outline-none transition-all placeholder:text-slate-400 focus:border-sgu-turquoise focus:bg-white focus:ring-4 focus:ring-sgu-turquoise/10"
            />
          </div>

          <div className="mt-6">
            {!trimmedQuery ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <h3 className="font-black text-sgu-navy">Start searching</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Type above to see matching products.
                </p>
              </div>
            ) : isSearching ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-bold text-sgu-navy">
                Searching products...
              </div>
            ) : searchError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-600">
                <FiAlertCircle className="mr-2 inline h-4 w-4" />
                {searchError}
              </div>
            ) : trimmedQuery && results.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                <h3 className="font-black text-sgu-navy">No products found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try a broader term or include out-of-stock products.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((product) => (
                  <ProductResultCard
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
