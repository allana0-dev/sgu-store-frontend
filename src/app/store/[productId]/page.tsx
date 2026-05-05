import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/store/ProductDetailClient";
import type { Product } from "@/components/store/ProductDetailClient";
import { getProduct, listProducts, type BackendProduct } from "@/lib/products";

const FALLBACK_PRODUCT_IMAGE = "/images/heroimage.png";

function mapBackendToProduct(p: BackendProduct): Product {
  const dedupedImages = [p.image, ...(p.images ?? [])]
    .map((entry) => entry.trim())
    .filter(
      (entry, index, allEntries) =>
        entry.length > 0 && allEntries.indexOf(entry) === index,
    );
  const image = dedupedImages[0] ?? FALLBACK_PRODUCT_IMAGE;

  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || p.category || "",
    description: p.description ?? "",
    images: dedupedImages.length > 0 ? dedupedImages : [image],
    image,
    href: p.href || `/store/${p.id}`,
    pricing: p.pricing,
    inventoryStatus: p.inventoryStatus,
    inventoryLabel:
      p.inventoryLabel ||
      (p.inventoryStatus === "out_of_stock" ? "Out of Stock" : "In Stock"),
    department: p.department,
    gender: p.gender,
    dietary: p.dietary,
    category: p.category ?? undefined,
    tags: p.tags,
    rating: p.rating ?? undefined,
    reviewCount: p.reviewCount,
    variants: p.variants,
  };
}

async function getProductById(id: string): Promise<Product | null> {
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

  let relatedProducts: Product[] = [];

  try {
    const backendProducts = await listProducts(24);
    const mappedProducts = backendProducts.map(mapBackendToProduct);
    relatedProducts = mappedProducts
      .filter(
        (p) =>
          p.id !== productId &&
          (p.department ?? p.category) ===
            (product.department ?? product.category),
      )
      .slice(0, 4);

    if (relatedProducts.length < 4) {
      const more = mappedProducts
        .filter(
          (p) => p.id !== productId && !relatedProducts.some((rp) => rp.id === p.id),
        )
        .slice(0, 4 - relatedProducts.length);
      relatedProducts.push(...more);
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <main className="bg-surface min-h-screen py-8">
      <div className="container-shell">
        <ProductDetailClient
          key={product.id}
          product={product}
          relatedProducts={relatedProducts}
        />
      </div>
    </main>
  );
}
