"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AUTH_TOKEN_STORAGE_KEY,
  type AuthResponse,
  type AuthUser,
  authRequest,
} from "@/lib/auth";

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCurrentUser = useCallback(async () => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authRequest<AuthResponse>("/auth/me", {
        token: storedToken,
      });
      setUser(response.user);
      setToken(storedToken);
    } catch {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCurrentUser();
  }, [refreshCurrentUser]);

  const register = useCallback(async (input: RegisterInput) => {
    await authRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: input,
    });
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const response = await authRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: input,
    });

    if (!response.accessToken) {
      throw new Error("Login succeeded but no token was returned.");
    }

    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.accessToken);
    setUser(response.user);
    setToken(response.accessToken);
  }, []);

  const logout = useCallback(async () => {
    const storedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

    try {
      await authRequest<{ message: string }>("/auth/logout", {
        method: "POST",
        token: storedToken,
      });
    } finally {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setUser(null);
      setToken(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      register,
      login,
      logout,
      refreshCurrentUser,
    }),
    [user, token, isLoading, register, login, logout, refreshCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
