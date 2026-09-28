import { describe, it, expect } from "vitest";
import { sanitizeContext } from "../../src/lib/logger/logger.js";

describe("Logger Context Sanitization", () => {
  it("should redact sensitive fields", () => {
    const raw = {
      user: "traveler",
      password: "mySecretPassword123!",
      jwt_secret: "super-secret-key",
      apiKey: "some-api-key",
      database_url: "postgresql://postgres:secret@localhost:5432/db",
    };

    const sanitized = sanitizeContext(raw) as Record<string, unknown>;

    expect(sanitized.user).toBe("traveler");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.jwt_secret).toBe("[REDACTED]");
    expect(sanitized.database_url).toBe("[REDACTED]");
  });

  it("should redact connection strings embedded in nested values", () => {
    const raw = {
      config: {
        connString: "postgresql://user:pass@remote:5432/prod",
      },
    };

    const sanitized = sanitizeContext(raw) as { config: { connString: string } };
    expect(sanitized.config.connString).toBe("[REDACTED_DATABASE_URL]");
  });
});
