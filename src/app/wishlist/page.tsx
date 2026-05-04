import WishlistClient from "@/app/wishlist/WishlistClient";
import homePopularProductsData from "@/data/home-popular-products.json";
import type { Product } from "@/components/store/ProductDetailClient";

export default function WishlistPage() {
  return <WishlistClient products={homePopularProductsData as Product[]} />;
}
