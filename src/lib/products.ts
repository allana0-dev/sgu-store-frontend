import { apiRequest } from "@/lib/api";
import type { Product } from "@/components/store/ProductDetailClient";

export type BackendProduct = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tags: string[];
  imageUrl: string | null;
  price: number;
  rating: number | null;
  reviewCount: number;
  inStock: boolean;
  inventory: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductRecommendation = BackendProduct & {
  score: number;
  reason: string;
};

export type RecommendationsResponse = {
  query: string;
  mode: "ai" | "fallback";
  summary: string;
  recommendations: ProductRecommendation[];
};

export function getProduct(id: string) {
  return apiRequest<BackendProduct>(`/products/${encodeURIComponent(id)}`);
}

export function searchProducts(query: string, limit = 12, onlyInStock = false) {
  const params = new URLSearchParams({
    query,
    limit: String(limit),
    onlyInStock: String(onlyInStock),
  });

  return apiRequest<BackendProduct[]>(`/products/search?${params.toString()}`);
}

export function mapLocalProductToBackendProduct(
  product: Product,
): BackendProduct {
  const inventory =
    product.inventoryStatus === "out_of_stock"
      ? 0
      : Number(product.inventoryLabel.match(/\d+/)?.[0] || 10);

  return {
    id: product.id,
    name: product.name,
    description: product.description || product.subtitle || null,
    category: product.category || product.department || null,
    tags: product.tags || [],
    imageUrl: product.image || product.images?.[0] || null,
    price: product.pricing.salePrice ?? product.pricing.basePrice,
    rating: null,
    reviewCount: 0,
    inStock: product.inventoryStatus !== "out_of_stock",
    inventory,
    isActive: true,
    createdAt: "",
    updatedAt: "",
  };
}

export function searchLocalProducts(
  products: Product[],
  query: string,
  limit = 12,
  onlyInStock = false,
) {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);

  if (terms.length === 0) {
    return [];
  }

  return products
    .map(mapLocalProductToBackendProduct)
    .filter((product) => {
      if (onlyInStock && !product.inStock) {
        return false;
      }

      const searchable = [
        product.name,
        product.description,
        product.category,
        ...product.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return terms.some((term) => searchable.includes(term));
    })
    .slice(0, limit);
}

export function getLocalRecommendations(
  products: Product[],
  query: string,
  limit = 6,
  existingIds: string[] = [],
): ProductRecommendation[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2);
  const existingIdSet = new Set(existingIds);

  return products
    .map(mapLocalProductToBackendProduct)
    .filter((product) => !existingIdSet.has(product.id) && product.inStock)
    .map((product) => {
      const searchable = [
        product.name,
        product.description,
        product.category,
        ...product.tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (searchable.includes(term) ? 1 : 0),
        0,
      );

      return {
        ...product,
        score,
        reason:
          score > 0
            ? "This local catalog item matches your search intent."
            : "This local catalog item is a popular in-stock campus essential.",
      };
    })
    .filter((product) => product.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit);
}

export function getRecommendations(query: string, limit = 6, userId?: number) {
  return apiRequest<RecommendationsResponse>("/recommendations", {
    method: "POST",
    body: {
      query,
      limit,
      ...(userId ? { userId } : {}),
    },
  });
}
