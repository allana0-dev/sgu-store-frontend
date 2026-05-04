import { apiRequest } from "@/lib/api";

export type AdminProduct = {
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

export type CreateProductPayload = {
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  inventory?: number;
  inStock?: boolean;
  isActive?: boolean;
};

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  inventory?: number;
  inStock?: boolean;
  isActive?: boolean;
};

export function listAdminProducts(limit = 200) {
  return apiRequest<AdminProduct[]>(`/products?limit=${limit}`);
}

export function createProduct(token: string, payload: CreateProductPayload) {
  return apiRequest<AdminProduct>("/products", {
    method: "POST",
    body: payload,
    token,
  });
}

export function updateProduct(
  token: string,
  id: string,
  payload: UpdateProductPayload,
) {
  return apiRequest<AdminProduct>(`/products/${id}`, {
    method: "PATCH",
    body: payload,
    token,
  });
}
