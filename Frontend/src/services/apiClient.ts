import type { ApiResponse, ApiErrorResponse } from "@offbeat/shared";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string = "API_ERROR",
    public details: unknown[] = [],
    public status?: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

/**
 * Universal type-safe HTTP client for OFFBEAT backend endpoints.
 */
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  const requestId = `client_${Math.random().toString(36).substring(2, 10)}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("X-Request-ID")) {
    headers.set("X-Request-ID", requestId);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiClientError(
      `Network connection to OFFBEAT backend failed (${err instanceof Error ? err.message : "check server"})`,
      "NETWORK_ERROR",
      [],
    );
  }

  let json: ApiResponse<T> | ApiErrorResponse;
  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      `Received non-JSON response from server [HTTP ${response.status}]`,
      "INVALID_RESPONSE",
      [],
      response.status,
    );
  }

  if (!response.ok || !json.success) {
    const errorData = (json as ApiErrorResponse).error;
    throw new ApiClientError(
      errorData?.message || `Server error [HTTP ${response.status}]`,
      errorData?.code || "SERVER_ERROR",
      errorData?.details || [],
      response.status,
    );
  }

  return (json as ApiResponse<T>).data;
}
