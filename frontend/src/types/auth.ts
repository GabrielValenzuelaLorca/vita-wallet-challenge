import type { AuthUserSchema } from "@/schemas/auth";

export type AuthUser = AuthUserSchema;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
