import type { AuthUserSchema } from "@/schemas/auth";

export type AuthUser = AuthUserSchema;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
