/**
 * @offbeat/shared
 * Baseline shared API envelopes and common contracts across OFFBEAT.
 */

export interface ApiMeta {
  requestId: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
