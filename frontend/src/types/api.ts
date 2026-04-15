import type { ApiMeta } from "@/schemas/common";

export type { ApiMeta, ApiError } from "@/schemas/common";

export interface ApiEnvelope<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}
