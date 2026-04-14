import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { AuthUser, LoginCredentials } from "@/types/auth";
import { authApi } from "@/services/api";
import { AuthContext } from "./authTypes";

const TOKEN_KEY = "auth_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(getStoredToken() !== null);

  const isAuthenticated = token !== null && user !== null;

  useEffect(() => {
    if (token === null) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function validateSession() {
      try {
        const response = await authApi.me();
        if (!cancelled) {
          setUser(response.data.user);
        }
      } catch {
        if (!cancelled) {
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    validateSession();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      const response = await authApi.login(credentials);
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(newUser);
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
