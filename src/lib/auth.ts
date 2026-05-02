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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "https://sgu-ecommerce-backend.onrender.com";

export const AUTH_TOKEN_STORAGE_KEY = "sgu-auth-token";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
};

export async function authRequest<T>(path: string, options: RequestOptions = {}) {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      "We couldn't connect right now. Please check your connection and try again.",
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message instanceof Array
        ? data.message.join(" ")
        : data?.message || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data as T;
}
