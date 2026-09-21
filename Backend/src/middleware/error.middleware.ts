import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@offbeat/types";
import { logger } from "../lib/logger.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const requestId = req.id || "unknown";

  logger.error("Request error:", {
    requestId,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err instanceof ZodError) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      meta: {
        requestId,
      },
    };
    res.status(400).json(errorResponse);
    return;
  }

  if (err instanceof AppError) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      meta: {
        requestId,
      },
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  const genericResponse: ApiErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected internal server error occurred",
    },
    meta: {
      requestId,
    },
  };

  res.status(500).json(genericResponse);
};
