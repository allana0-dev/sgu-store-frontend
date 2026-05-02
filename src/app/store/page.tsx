import StoreClient from "@/components/store/StoreClient";
import homePopularProductsData from "@/data/home-popular-products.json";

export default function StorePage() {
  return (
    <StoreClient
      products={
        homePopularProductsData as import("@/components/store/ProductDetailClient").Product[]
      }
    />
  );
}
