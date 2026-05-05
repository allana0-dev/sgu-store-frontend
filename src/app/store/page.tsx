import StoreClient from "@/components/store/StoreClient";
import type { Product } from "@/components/store/ProductDetailClient";
import { listProducts, type BackendProduct } from "@/lib/products";

const FALLBACK_PRODUCT_IMAGE = "/images/heroimage.png";

function mapBackendToProduct(product: BackendProduct): Product {
  const dedupedImages = [product.image, ...(product.images ?? [])]
    .map((image) => image.trim())
    .filter(
      (image, index, allImages) =>
        image.length > 0 && allImages.indexOf(image) === index,
    );
  const image = dedupedImages[0] ?? FALLBACK_PRODUCT_IMAGE;

  return {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle || product.category || "",
    description: product.description ?? "",
    images: dedupedImages.length > 0 ? dedupedImages : [image],
    image,
    href: `/store/${product.id}`,
    pricing: product.pricing,
    inventoryStatus: product.inventoryStatus,
    inventoryLabel:
      product.inventoryLabel ||
      (product.inventoryStatus === "out_of_stock" ? "Out of Stock" : "In Stock"),
    department: product.department,
    gender: product.gender,
    dietary: product.dietary,
    category: product.category ?? undefined,
    tags: product.tags,
    rating: product.rating ?? undefined,
    reviewCount: product.reviewCount,
    variants: product.variants,
  };
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; store?: string }>;
}) {
  const { category } = await searchParams;
  let products: Product[] = [];

  try {
    const backendProducts = await listProducts(200);
    products = backendProducts.map(mapBackendToProduct);
  } catch {
    products = [];
  }

  return (
    <StoreClient
      key={category ?? "all"}
      products={products}
      initialCategory={category}
    />
  );
}
