import { apiRequest } from "@/lib/api";

export type ProductReview = {
  id: number;
  productId: string;
  displayName: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewInput = {
  displayName: string;
  rating: number;
  title?: string;
  body: string;
};

export function getProductReviews(productId: string) {
  return apiRequest<ProductReview[]>(
    `/products/${encodeURIComponent(productId)}/reviews`,
  );
}

export function createProductReview(
  productId: string,
  input: CreateReviewInput,
) {
  return apiRequest<ProductReview>(
    `/products/${encodeURIComponent(productId)}/reviews`,
    {
      method: "POST",
      body: input,
    },
  );
}
