import { API_PREFIX } from "@offbeat/config";
import type { ApiResponse, HealthStatus } from "@offbeat/types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export class ApiClient {
  private static baseUrl = `${BASE_URL}${API_PREFIX}`;

  public static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as ApiResponse<T>;
  }

  public static async checkHealth(): Promise<ApiResponse<HealthStatus>> {
    return this.get<HealthStatus>("/health");
  }
}
