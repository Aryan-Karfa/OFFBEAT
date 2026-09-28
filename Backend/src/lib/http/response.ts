import type { Response } from "express";
import type { ApiResponse, ApiErrorResponse, ApiError, ApiMeta } from "@offbeat/shared";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  additionalMeta: Partial<ApiMeta> = {},
): Response {
  const requestId = (res.req as Express.Request).requestId || "unknown_req";

  const responseBody: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...additionalMeta,
    },
  };

  return res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  error: ApiError,
  statusCode: number = 500,
  additionalMeta: Partial<ApiMeta> = {},
): Response {
  const requestId = (res.req as Express.Request).requestId || "unknown_req";

  const responseBody: ApiErrorResponse = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details ?? [],
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...additionalMeta,
    },
  };

  return res.status(statusCode).json(responseBody);
}
