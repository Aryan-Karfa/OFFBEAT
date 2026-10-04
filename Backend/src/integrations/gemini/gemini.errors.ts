import { AppError } from "../../lib/errors/AppError.js";
import { ERROR_CODES } from "../../lib/errors/errorCodes.js";

export class GeminiError extends AppError {
  constructor(
    message: string,
    statusCode: number = 502,
    code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES] = ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true,
  ) {
    super(message, statusCode, code, [], isOperational);
    this.name = this.constructor.name;
  }
}

export class GeminiConfigurationError extends GeminiError {
  constructor(message: string = "Gemini configuration error: API key missing or invalid model") {
    super(message, 500, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class GeminiAuthenticationError extends GeminiError {
  constructor(message: string = "Gemini authentication failed: invalid or unauthorized API key") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class GeminiTimeoutError extends GeminiError {
  constructor(message: string = "Gemini reasoning request timed out") {
    super(message, 504, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class GeminiRateLimitError extends GeminiError {
  constructor(message: string = "Gemini quota or rate limit exceeded") {
    super(message, 429, ERROR_CODES.RATE_LIMITED);
  }
}

export class GeminiProviderError extends GeminiError {
  constructor(message: string = "Gemini provider returned an error") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class GeminiOutputValidationError extends GeminiError {
  constructor(
    message: string = "Gemini structured output failed schema or business-rule validation",
  ) {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}

export class GeminiSafetyBlockedError extends GeminiError {
  constructor(message: string = "Gemini response was blocked by safety settings") {
    super(message, 502, ERROR_CODES.INTERNAL_ERROR);
  }
}
