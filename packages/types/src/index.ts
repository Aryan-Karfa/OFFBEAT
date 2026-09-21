/**
 * OFFBEAT — Core Shared Types
 * Minimal foundational contracts for Phase 0
 */

export interface ApiMeta {
  requestId: string;
  timestamp?: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  uptime: number;
  timestamp: string;
}

export interface UserSummary {
  id: string;
  email: string;
  username: string;
  status: string;
}
