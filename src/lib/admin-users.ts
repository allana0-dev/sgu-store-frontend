import { apiRequest } from "@/lib/api";

export type UserRole = "CUSTOMER" | "ADMIN";

export type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export function listAdminUsers(limit = 250, token?: string | null) {
  return apiRequest<AdminUser[]>(`/users?limit=${limit}`, {
    token,
  });
}

export async function updateUserRole(
  id: number,
  role: UserRole,
  token?: string | null,
) {
  try {
    return await apiRequest<AdminUser>(`/users/${id}`, {
      method: "PATCH",
      body: { role },
      token,
    });
  } catch (error) {
    // Support alternate backend route shape if role updates are separated.
    return apiRequest<AdminUser>(`/users/${id}/role`, {
      method: "PATCH",
      body: { role },
      token,
    }).catch(() => {
      throw error;
    });
  }
}
