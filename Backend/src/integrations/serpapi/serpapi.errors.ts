import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";

export class SerpApiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 500,
    code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES] = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true,
  ) {
    super(message, statusCode, code, [], isOperational);
    this.name = this.constructor.name;
  }
}

export class SerpApiConfigurationError extends SerpApiError {
  constructor(message: string = "SerpApi configuration error: API key missing or invalid") {
    super(message, 500, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class SerpApiAuthenticationError extends SerpApiError {
  constructor(message: string = "SerpApi authentication failed: invalid or unauthorized API key") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class SerpApiRateLimitError extends SerpApiError {
  constructor(message: string = "SerpApi rate limit exceeded or quota exhausted") {
    super(message, 429, ERROR_CODES.RATE_LIMITED);
  }
}

export class SerpApiTimeoutError extends SerpApiError {
  constructor(message: string = "SerpApi request timed out") {
    super(message, 504, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class SerpApiNetworkError extends SerpApiError {
  constructor(message: string = "SerpApi network communication error") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class SerpApiInvalidResponseError extends SerpApiError {
  constructor(message: string = "SerpApi returned an invalid or malformed response") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class SerpApiProviderError extends SerpApiError {
  constructor(message: string = "SerpApi provider returned an error") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}
