import type { LoginCredentials, AuthResponse } from "@/types/auth";
import type { ApiEnvelope } from "@/types/api";

// Shell API -- real implementations will be added in Phase 2

export const authApi = {
  async login(_credentials: LoginCredentials): Promise<ApiEnvelope<AuthResponse>> {
    throw new Error("Not implemented: authApi.login will be connected in Phase 2");
  },

  async register(
    _credentials: LoginCredentials,
  ): Promise<ApiEnvelope<AuthResponse>> {
    throw new Error(
      "Not implemented: authApi.register will be connected in Phase 2",
    );
  },
};
