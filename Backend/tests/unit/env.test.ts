import { describe, it, expect } from "vitest";
import { validateEnv } from "../../src/config/env.js";

describe("Environment Validation", () => {
  it("should validate and apply default values for development", () => {
    const parsed = validateEnv({
      NODE_ENV: "development",
    });

    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.PORT).toBe(5000);
    expect(parsed.CORS_ORIGIN).toBe("http://localhost:5173");
    expect(parsed.GEMINI_MODEL).toBe("gemini-3.8-flash");
  });

  it("should correctly parse custom PORT string into integer", () => {
    const parsed = validateEnv({
      PORT: "4000",
    });

    expect(parsed.PORT).toBe(4000);
  });

  it("should fail validation if PORT is out of range", () => {
    expect(() =>
      validateEnv({
        PORT: "999999",
      }),
    ).toThrow();
  });

  it("should fail validation if NODE_ENV is invalid", () => {
    expect(() =>
      validateEnv({
        NODE_ENV: "invalid_env",
      }),
    ).toThrow();
  });
});
