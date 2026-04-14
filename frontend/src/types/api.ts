export interface ApiMeta {
  page?: number;
  per_page?: number;
  total?: number;
}

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
