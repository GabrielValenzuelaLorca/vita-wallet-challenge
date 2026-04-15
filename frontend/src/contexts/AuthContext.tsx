import { useState, useEffect, useCallback, type ReactNode } from "react";
import type { AuthUser, LoginCredentials } from "@/types/auth";
import { authApi } from "@/services/api";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "@/services/tokenStorage";
import { AuthContext } from "./authTypes";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken);
  const [isLoading, setIsLoading] = useState<boolean>(getAuthToken() !== null);

  const isAuthenticated = token !== null && user !== null;

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    removeAuthToken();
  }, []);

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
          removeAuthToken();
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

  // Listen for 401 events dispatched by httpClient to force logout
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      window.location.href = "/login";
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      const response = await authApi.login(credentials);
      const { token: newToken, user: newUser } = response.data;
      setAuthToken(newToken);
      setToken(newToken);
      setUser(newUser);
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
