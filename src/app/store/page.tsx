import StoreClient from "@/components/store/StoreClient";
import homePopularProductsData from "@/data/home-popular-products.json";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; store?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <StoreClient
      key={category ?? "all"}
      products={
        homePopularProductsData as import("@/components/store/ProductDetailClient").Product[]
      }
      initialCategory={category}
    />
  );
}
