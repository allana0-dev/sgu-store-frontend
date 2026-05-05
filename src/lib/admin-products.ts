import { apiRequest } from "@/lib/api";
import type {
  BackendProduct,
  InventoryStatus,
  Gender,
  ProductPricing,
  ProductVariant,
} from "@/lib/products";

export type AdminProduct = BackendProduct;

export type CreateProductPayload = {
  id?: string;
  name: string;
  subtitle: string;
  description?: string;
  category?: string;
  tags?: string[];
  images: string[];
  image: string;
  href: string;
  pricing: ProductPricing;
  inventoryStatus: InventoryStatus;
  inventoryLabel: string;
  department: string;
  gender: Gender;
  dietary: string[] | null;
  variants: ProductVariant[] | null;
  rating?: number;
  reviewCount?: number;
  inventory?: number;
  isActive?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  subtitle?: string;
  description?: string;
  category?: string;
  tags?: string[];
  images?: string[];
  image?: string;
  href?: string;
  pricing?: Partial<ProductPricing>;
  inventoryStatus?: InventoryStatus;
  inventoryLabel?: string;
  department?: string;
  gender?: Gender;
  dietary?: string[] | null;
  variants?: ProductVariant[] | null;
  rating?: number;
  reviewCount?: number;
  inventory?: number;
  isActive?: boolean;
};

export function listAdminProducts(limit = 200, token?: string | null) {
  return apiRequest<AdminProduct[]>(`/products?limit=${limit}`, {
    token,
  });
}

export function createProduct(
  token: string | null | undefined,
  payload: CreateProductPayload,
) {
  return apiRequest<AdminProduct>("/products", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateProduct(
  token: string | null | undefined,
  id: string,
  payload: UpdateProductPayload,
) {
  return apiRequest<AdminProduct>(`/products/${id}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}
