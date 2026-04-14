import type { LoginCredentials } from "@/types/auth";
import { httpClient } from "@/services/httpClient";
import {
  authResponseSchema,
  meResponseSchema,
  type AuthResponseSchema,
  type MeResponseSchema,
} from "@/schemas/auth";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponseSchema> {
    const raw = await httpClient.post<AuthResponseSchema>("/auth/login", {
      body: credentials,
    });
    return authResponseSchema.parse(raw);
  },

  async register(credentials: LoginCredentials): Promise<AuthResponseSchema> {
    const raw = await httpClient.post<AuthResponseSchema>("/auth/register", {
      body: credentials,
    });
    return authResponseSchema.parse(raw);
  },

  async me(): Promise<MeResponseSchema> {
    const raw = await httpClient.get<MeResponseSchema>("/auth/me");
    return meResponseSchema.parse(raw);
  },
};
