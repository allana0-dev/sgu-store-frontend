import { notFound } from "next/navigation";
import homePopularProductsData from "@/data/home-popular-products.json";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import type { Product } from "@/components/store/ProductDetailClient";
import { getProduct, type BackendProduct } from "@/lib/products";

function mapBackendToProduct(p: BackendProduct): Product {
  return {
    id: p.id,
    name: p.name,
    subtitle: p.category ?? "",
    description: p.description ?? "",
    images: p.imageUrl ? [p.imageUrl] : [],
    image: p.imageUrl ?? "",
    href: `/store/${p.id}`,
    pricing: {
      currency: "USD",
      basePrice: p.price,
      salePrice: null,
      compareAtPrice: null,
    },
    inventoryStatus: p.inStock ? "in_stock" : "out_of_stock",
    inventoryLabel: p.inStock ? "In Stock" : "Out of Stock",
    category: p.category ?? undefined,
    tags: p.tags,
    rating: p.rating ?? undefined,
    reviewCount: p.reviewCount,
    variants: null,
  };
}

async function getProductById(id: string): Promise<Product | null> {
  const local = homePopularProductsData.find((p) => p.id === id);
  if (local) return local as unknown as Product;

  try {
    const backendProduct = await getProduct(id);
    return mapBackendToProduct(backendProduct);
  } catch {
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  // Next.js 15+ convention: params is a Promise
  const { productId } = await params;

  const product = await getProductById(productId);

  if (!product) {
    notFound();
  }

  // Find related products (same category/department, fallback to first 4)
  const relatedProducts = (homePopularProductsData as unknown as Product[])
    .filter(
      (p) =>
        p.id !== productId &&
        (p.department ?? p.category) ===
          (product.department ?? product.category),
    )
    .slice(0, 4);

  // If not enough related, pad with others
  if (relatedProducts.length < 4) {
    const more = (homePopularProductsData as unknown as Product[])
      .filter((p) => p.id !== productId && !relatedProducts.includes(p))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...more);
  }

  return (
    <main className="bg-surface min-h-screen py-8">
      <div className="container-shell">
        <ProductDetailClient
          product={product}
          relatedProducts={relatedProducts}
        />
      </div>
    </main>
  );
}
