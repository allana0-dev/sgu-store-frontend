import { notFound } from "next/navigation";
import homePopularProductsData from "@/data/home-popular-products.json";
import ProductDetailClient from "@/components/store/ProductDetailClient";

// A mock async function to simulate fetching a product by ID
async function getProductById(id: string) {
  // In a real app, this would be a DB or API call
  return homePopularProductsData.find((p) => p.id === id) || null;
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

  // Find related products (just a simple mock, e.g. same department or first 4)
  const relatedProducts = homePopularProductsData
    .filter((p) => p.id !== productId && p.department === product.department)
    .slice(0, 4);

  // If not enough related, pad with others
  if (relatedProducts.length < 4) {
    const more = homePopularProductsData
      .filter((p) => p.id !== productId && !relatedProducts.includes(p))
      .slice(0, 4 - relatedProducts.length);
    relatedProducts.push(...more);
  }

  return (
    <main className="bg-surface min-h-screen py-8">
      <div className="container-shell">
        <ProductDetailClient
          product={
            product as import("@/components/store/ProductDetailClient").Product
          }
          relatedProducts={
            relatedProducts as import("@/components/store/ProductDetailClient").Product[]
          }
        />
      </div>
    </main>
  );
}
