import { apiRequest } from "@/lib/api";

export type UserRole = "CUSTOMER" | "ADMIN";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken?: string;
  tokenType?: "Bearer";
};

export const AUTH_TOKEN_STORAGE_KEY = "sgu-auth-token";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
};

export async function authRequest<T>(
  path: string,
  options: RequestOptions = {},
) {
  return apiRequest<T>(path, options);
}
