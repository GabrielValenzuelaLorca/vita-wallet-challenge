import { getAuthToken, removeAuthToken } from "@/services/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

export class ApiRequestError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(statusCode: number, errorCode: string, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

interface ErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

interface RequestOptions {
  body?: object;
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

function isAuthPath(path: string): boolean {
  return path.includes("/auth/");
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options?.body && method !== "GET") {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const url = buildUrl(path, options?.params);
  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorCode = "UNKNOWN_ERROR";
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorBody: ErrorBody = await response.json();
      if (errorBody.error) {
        errorCode = errorBody.error.code ?? errorCode;
        errorMessage = errorBody.error.message ?? errorMessage;
      }
    } catch {
      // Response body is not JSON, use defaults
    }

    if (response.status === 401 && !isAuthPath(path)) {
      removeAuthToken();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    throw new ApiRequestError(response.status, errorCode, errorMessage);
  }

  const data: T = await response.json();
  return data;
}

export const httpClient = {
  get<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return request<T>("GET", path, options);
  },

  post<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("POST", path, options);
  },

  put<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>("PUT", path, options);
  },

  delete<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return request<T>("DELETE", path, options);
  },
};
