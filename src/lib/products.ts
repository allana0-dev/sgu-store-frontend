import { apiRequest } from "@/lib/api";
import type { Product } from "@/components/store/ProductDetailClient";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";
export type Gender = "women" | "men" | "unisex";

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

function normalizeGender(value: string | undefined): Gender {
  if (value === "women" || value === "men" || value === "unisex") {
    return value;
  }

  return "unisex";
}

export type BackendProduct = {
  id: string;
  href: string;
  name: string;
  subtitle: string;
  description: string | null;
  category: string | null;
  tags: string[];
  images: string[];
  image: string;
  pricing: ProductPricing;
  inventoryStatus: InventoryStatus;
  inventoryLabel: string;
  department: string;
  gender: Gender;
  dietary: string[] | null;
  variants: ProductVariant[] | null;
  rating: number | null;
  reviewCount: number;
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

export function listProducts(limit = 10) {
  return apiRequest<BackendProduct[]>(`/products?limit=${limit}`);
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
  const dedupedImages = [product.image, ...product.images]
    .map((image) => image.trim())
    .filter(
      (image, index, allImages) =>
        image.length > 0 && allImages.indexOf(image) === index,
    );
  const primaryImage = dedupedImages[0] ?? "/images/heroimage.png";
  const inventory =
    product.inventoryStatus === "out_of_stock"
      ? 0
      : Number(product.inventoryLabel.match(/\d+/)?.[0] || 10);

  return {
    id: product.id,
    href: product.href || `/store/${product.id}`,
    name: product.name,
    subtitle: product.subtitle,
    description: product.description || product.subtitle || null,
    category: product.category || product.department || null,
    tags: product.tags || [],
    images: dedupedImages.length > 0 ? dedupedImages : [primaryImage],
    image: primaryImage,
    pricing: {
      currency: product.pricing.currency,
      basePrice: product.pricing.basePrice,
      salePrice: product.pricing.salePrice,
      compareAtPrice: product.pricing.compareAtPrice,
    },
    inventoryStatus: product.inventoryStatus,
    inventoryLabel: product.inventoryLabel,
    department: product.department ?? product.category ?? "General",
    gender: normalizeGender(product.gender),
    dietary: product.dietary ?? null,
    variants: product.variants ?? null,
    rating: product.rating ?? null,
    reviewCount: product.reviewCount ?? 0,
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
      if (onlyInStock && product.inventoryStatus === "out_of_stock") {
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
    .filter(
      (product) =>
        !existingIdSet.has(product.id) &&
        product.inventoryStatus !== "out_of_stock",
    )
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
