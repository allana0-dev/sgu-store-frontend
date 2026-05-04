"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import {
  FiHeart,
  FiChevronRight,
  FiFilter,
  FiX,
  FiCheck,
  FiShoppingCart,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import type { Product, ProductPricing } from "./ProductDetailClient";
import ProductCard from "./ProductCard";

const getCurrentPrice = (pricing: ProductPricing) =>
  pricing.salePrice ?? pricing.basePrice;

export default function StoreClient({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : [],
  );
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");

  // Responsive mobile filter toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Unique categories derived from products
  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    ) as string[];
  }, [products]);

  const formatCategory = (slug: string) =>
    slug.charAt(0).toUpperCase() + slug.slice(1);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter(
        (p) => p.category && selectedCategories.includes(p.category),
      );
    }

    // Rating Filter
    if (selectedRatings.length > 0) {
      result = result.filter(
        (p) => p.rating && selectedRatings.includes(Math.floor(p.rating)),
      );
    }

    // Availability Filter
    if (availability.length > 0) {
      if (availability.includes("in_stock")) {
        result = result.filter((p) => p.inventoryStatus === "in_stock");
      }
      if (availability.includes("out_of_stock")) {
        result = result.filter(
          (p) =>
            p.inventoryStatus === "out_of_stock" ||
            p.inventoryStatus === "low_stock",
        );
      }
    }

    // Sorting Logic
    if (sortBy === "price-low") {
      result.sort(
        (a, b) => getCurrentPrice(a.pricing) - getCurrentPrice(b.pricing),
      );
    } else if (sortBy === "price-high") {
      result.sort(
        (a, b) => getCurrentPrice(b.pricing) - getCurrentPrice(a.pricing),
      );
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [products, selectedCategories, selectedRatings, availability, sortBy]);

  // Toggles
  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  const toggleAvailability = (val: string) => {
    setAvailability((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  const removeFilter = (
    type: "category" | "rating" | "availability",
    value: string | number,
  ) => {
    if (type === "category" && typeof value === "string") toggleCategory(value);
    if (type === "rating" && typeof value === "number") toggleRating(value);
    if (type === "availability" && typeof value === "string")
      toggleAvailability(value);
  };

  const activeFilterCount =
    selectedCategories.length + selectedRatings.length + availability.length;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="container-shell py-8 lg:py-12 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-sgu-navy transition-colors">
            Home
          </Link>
          <FiChevronRight className="mx-2 w-3 h-3" />
          <span className="text-sgu-navy">Shop</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-sgu-navy">Filter Products</span>
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="p-2 bg-slate-100 rounded-lg text-sgu-navy flex items-center gap-2"
            >
              <FiFilter />
              <span className="text-sm font-bold">
                {activeFilterCount > 0
                  ? `Filters (${activeFilterCount})`
                  : "Filter"}
              </span>
            </button>
          </div>

          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 shrink-0 flex flex-col gap-8 ${isMobileFilterOpen ? "block" : "hidden lg:flex"}`}
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-sgu-navy mb-6">
                Filter Options
              </h2>

              {/* Category Filter */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-sgu-navy mb-4">
                  Category
                </h3>
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggleCategory(cat)}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          selectedCategories.includes(cat)
                            ? "bg-sgu-turquoise border-sgu-turquoise text-white"
                            : "border-slate-300 bg-white group-hover:border-sgu-turquoise"
                        }`}
                      >
                        {selectedCategories.includes(cat) && (
                          <FiCheck className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-sgu-navy">
                        {formatCategory(cat)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Review Filter */}
              <div className="mb-8">
                <h3 className="font-bold text-sm text-sgu-navy mb-4">Review</h3>
                <div className="flex flex-col gap-3">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <label
                      key={star}
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggleRating(star)}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          selectedRatings.includes(star)
                            ? "bg-sgu-turquoise border-sgu-turquoise text-white"
                            : "border-slate-300 bg-white group-hover:border-sgu-turquoise"
                        }`}
                      >
                        {selectedRatings.includes(star) && (
                          <FiCheck className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sgu-orange">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < star ? "text-sgu-orange" : "text-slate-200"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-sgu-navy ml-1">
                        {star} Star
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div>
                <h3 className="font-bold text-sm text-sgu-navy mb-4">
                  Availability
                </h3>
                <div className="flex flex-col gap-3">
                  <label
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleAvailability("in_stock")}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        availability.includes("in_stock")
                          ? "bg-sgu-turquoise border-sgu-turquoise text-white"
                          : "border-slate-300 bg-white group-hover:border-sgu-turquoise"
                      }`}
                    >
                      {availability.includes("in_stock") && (
                        <FiCheck className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-sgu-navy">
                      In Stock
                    </span>
                  </label>
                  <label
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => toggleAvailability("out_of_stock")}
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        availability.includes("out_of_stock")
                          ? "bg-sgu-turquoise border-sgu-turquoise text-white"
                          : "border-slate-300 bg-white group-hover:border-sgu-turquoise"
                      }`}
                    >
                      {availability.includes("out_of_stock") && (
                        <FiCheck className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-sgu-navy">
                      Out of Stock
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Top Bar (Results & Sorting) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm gap-4">
              <p className="text-sm text-slate-500 font-medium">
                Showing{" "}
                <span className="font-bold text-sgu-navy">
                  1-{filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-sgu-navy">
                  {products.length}
                </span>{" "}
                results
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-sgu-navy">
                  Sort by:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-sm font-medium text-sgu-navy rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-sgu-turquoise/20 transition-all cursor-pointer"
                >
                  <option value="default">Default Sorting</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Active Filters Row */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-sgu-navy mr-2">
                  Active Filters:
                </span>
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-sgu-turquoise/10 text-sgu-turquoise text-xs font-bold rounded-full border border-sgu-turquoise/20"
                  >
                    {formatCategory(cat)}
                    <button
                      onClick={() => removeFilter("category", cat)}
                      className="hover:text-sgu-navy"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
                {selectedRatings.map((star) => (
                  <span
                    key={star}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-sgu-orange/10 text-sgu-orange text-xs font-bold rounded-full border border-sgu-orange/20"
                  >
                    {star} Star
                    <button
                      onClick={() => removeFilter("rating", star)}
                      className="hover:text-sgu-navy"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
                {availability.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full border border-emerald-500/20"
                  >
                    {val === "in_stock" ? "In Stock" : "Out of Stock"}
                    <button
                      onClick={() => removeFilter("availability", val)}
                      className="hover:text-sgu-navy"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedRatings([]);
                    setAvailability([]);
                  }}
                  className="text-xs font-bold text-sgu-red hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 py-16 px-4 text-center h-full">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                  <FiFilter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-sgu-navy mb-2">
                  No products found
                </h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md">
                  Try adjusting your filters or search criteria to find what
                  you&apos;re looking for.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedRatings([]);
                    setAvailability([]);
                  }}
                  className="bg-sgu-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-sgu-navy/90 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Row */}
      <div className="bg-white border-t border-slate-200 py-12 mt-auto">
        <div className="container-shell">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="flex flex-col items-center px-4 pt-4 md:pt-0">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <FiCheck className="w-8 h-8" />
              </div>
              <h4 className="font-black text-sgu-navy mb-2">
                Free Delivery on Campus
              </h4>
              <p className="text-sm text-slate-500">
                For orders bought through online payment
              </p>
            </div>
            <div className="flex flex-col items-center px-4 pt-8 md:pt-0">
              <div className="w-16 h-16 bg-sgu-turquoise/10 text-sgu-turquoise rounded-full flex items-center justify-center mb-4">
                <FiShoppingCart className="w-8 h-8" />
              </div>
              <h4 className="font-black text-sgu-navy mb-2">
                Flexible Payment
              </h4>
              <p className="text-sm text-slate-500">
                Multiple secure payment options
              </p>
            </div>
            <div className="flex flex-col items-center px-4 pt-8 md:pt-0">
              <div className="w-16 h-16 bg-sgu-orange/10 text-sgu-orange rounded-full flex items-center justify-center mb-4">
                <FiHeart className="w-8 h-8" />
              </div>
              <h4 className="font-black text-sgu-navy mb-2">24/7 Support</h4>
              <p className="text-sm text-slate-500">
                We&apos;re here to help you anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
