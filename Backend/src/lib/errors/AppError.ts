import type { ApiErrorDetail } from "@offbeat/shared";
import { ERROR_CODES, type ErrorCode } from "./errorCodes.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
    details: ApiErrorDetail[] = [],
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", details: ApiErrorDetail[] = []) {
    super(message, 404, ERROR_CODES.NOT_FOUND, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", details: ApiErrorDetail[] = []) {
    super(message, 400, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request", details: ApiErrorDetail[] = []) {
    super(message, 400, ERROR_CODES.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized", details: ApiErrorDetail[] = []) {
    super(message, 401, ERROR_CODES.UNAUTHORIZED, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden", details: ApiErrorDetail[] = []) {
    super(message, 403, ERROR_CODES.FORBIDDEN, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", details: ApiErrorDetail[] = []) {
    super(message, 409, ERROR_CODES.CONFLICT, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database error occurred", details: ApiErrorDetail[] = []) {
    super(message, 500, ERROR_CODES.DATABASE_ERROR, details);
  }
}

export class InternalError extends AppError {
  constructor(message: string = "Internal server error", details: ApiErrorDetail[] = []) {
    super(message, 500, ERROR_CODES.INTERNAL_ERROR, details);
  }
}
