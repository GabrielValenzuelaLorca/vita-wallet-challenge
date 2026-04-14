import { useState, type ReactNode } from "react";
import type { AuthUser, LoginCredentials } from "@/types/auth";
import { AuthContext } from "./authTypes";

const TOKEN_KEY = "auth_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading] = useState(false);

  const isAuthenticated = token !== null;

  const login = async (_credentials: LoginCredentials): Promise<void> => {
    // Shell -- real API integration comes in Phase 2
    throw new Error("Not implemented: login will be connected in Phase 2");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
