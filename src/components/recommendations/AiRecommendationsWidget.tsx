"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiMessageCircle,
  FiX,
  FiZap,
} from "react-icons/fi";
import type { Product } from "@/components/store/ProductDetailClient";
import homePopularProductsData from "@/data/home-popular-products.json";
import {
  getLocalRecommendations,
  getRecommendations,
  type BackendProduct,
  type ProductRecommendation,
  type RecommendationsResponse,
} from "@/lib/products";

const localProducts = homePopularProductsData as Product[];

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const getProductHref = (id: string) => `/store/${id}`;

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

function RecommendationCard({ product }: { product: ProductRecommendation }) {
  return (
    <div className="rounded-2xl border border-sgu-turquoise/20 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wide text-sgu-turquoise">
            {product.category || "Recommended"}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm font-black text-sgu-navy">
            {product.name}
          </h3>
        </div>
        <p className="shrink-0 text-sm font-black text-sgu-navy">
          {formatPrice(product.price)}
        </p>
      </div>
      <p className="mt-3 rounded-xl bg-sgu-turquoise/10 p-3 text-xs font-medium text-sgu-navy">
        {product.reason}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <span
          className={`inline-flex items-center gap-1.5 font-bold ${
            product.inStock ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <FiCheckCircle className="h-3.5 w-3.5" />
          {product.inStock ? "In stock" : "Out of stock"}
        </span>
        <Link
          href={getProductHref(product.id)}
          className="font-black text-sgu-turquoise hover:text-sgu-navy"
        >
          View item
        </Link>
      </div>
    </div>
  );
}

export default function AiRecommendationsWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState("");
  const [response, setResponse] = useState<RecommendationsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const recommendationQuery = intent.trim();
    if (!recommendationQuery) {
      setError("Tell us what you need help finding.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const backendResponse = await getRecommendations(recommendationQuery, 6);
      const localRecommendations = getLocalRecommendations(
        localProducts,
        recommendationQuery,
        6,
        backendResponse.recommendations.map((product) => product.id),
      );

      setResponse({
        ...backendResponse,
        summary:
          localRecommendations.length > 0
            ? `${backendResponse.summary} Also included local catalog matches.`
            : backendResponse.summary,
        recommendations: mergeProducts(
          backendResponse.recommendations,
          localRecommendations,
        ).slice(0, 6),
      });
    } catch (caughtError) {
      const localRecommendations = getLocalRecommendations(
        localProducts,
        recommendationQuery,
        6,
      );

      if (localRecommendations.length > 0) {
        setResponse({
          query: recommendationQuery,
          mode: "fallback",
          summary:
            "Backend recommendations are unavailable, so these are local catalog matches.",
          recommendations: localRecommendations,
        });
      } else {
        setResponse(null);
        setError(
          caughtError instanceof Error
            ? `${caughtError.message} No local recommendations matched either.`
            : "Recommendations are unavailable right now.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-4 bg-sgu-navy p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <FiZap className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-black">AI Recommendations</h2>
                <p className="mt-1 text-xs font-medium text-white/75">
                  Describe what you need and I’ll suggest SGU store items.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close AI recommendations"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                value={intent}
                onChange={(event) => setIntent(event.target.value)}
                rows={3}
                placeholder="I need something warm for evening study"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-sgu-navy outline-none transition-all placeholder:text-slate-400 focus:border-sgu-turquoise focus:bg-white focus:ring-4 focus:ring-sgu-turquoise/10"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-sgu-navy px-5 py-3 text-sm font-black text-white transition-colors hover:bg-sgu-turquoise disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Finding recommendations..." : "Ask AI"}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-3">
              {error ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                  <FiAlertCircle className="mr-2 inline h-4 w-4" />
                  {error}
                </div>
              ) : null}

              {response ? (
                <>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-sgu-navy">
                        {response.summary}
                      </p>
                      {response.mode === "fallback" ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                          Fallback
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      Based on: “{response.query}”
                    </p>
                  </div>

                  {response.recommendations.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {response.recommendations.map((product) => (
                        <RecommendationCard
                          key={product.id}
                          product={product}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                      <h3 className="font-black text-sgu-navy">
                        No recommendations yet
                      </h3>
                      <p className="mt-2 text-xs text-slate-500">
                        Try describing your goal in a different way.
                      </p>
                    </div>
                  )}
                </>
              ) : !error ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <h3 className="font-black text-sgu-navy">
                    Need help choosing?
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">
                    Ask for study supplies, snacks, apparel, or campus
                    essentials.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex items-center gap-2 rounded-full bg-sgu-navy px-5 py-3 text-sm font-black text-white shadow-2xl transition-all hover:-translate-y-0.5 hover:bg-sgu-turquoise ${
          isOpen ? "" : "ai-widget-nudge"
        }`}
        aria-label="Open AI recommendations"
      >
        <FiMessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>
    </div>
  );
}
