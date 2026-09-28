import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  BadRequestError,
} from "../../src/lib/errors/AppError.js";
import { ERROR_CODES } from "../../src/lib/errors/errorCodes.js";

describe("Application Errors", () => {
  it("NotFoundError should have status 404 and code NOT_FOUND", () => {
    const error = new NotFoundError("User missing");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.message).toBe("User missing");
  });

  it("ValidationError should have status 400 and code VALIDATION_ERROR", () => {
    const error = new ValidationError("Bad input", [{ field: "email", message: "Invalid email" }]);
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
    expect(error.details).toHaveLength(1);
  });

  it("ConflictError should have status 409 and code CONFLICT", () => {
    const error = new ConflictError("Email already in use");
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe(ERROR_CODES.CONFLICT);
  });

  it("BadRequestError should have status 400 and code BAD_REQUEST", () => {
    const error = new BadRequestError("Invalid format");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.BAD_REQUEST);
  });

  it("AppError should inherit from Error and maintain stack trace", () => {
    const error = new AppError("Generic error", 500);
    expect(error).toBeInstanceOf(Error);
    expect(error.stack).toBeDefined();
  });
});
