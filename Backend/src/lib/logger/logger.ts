export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const SENSITIVE_KEYS = new Set([
  "database_url",
  "databaseurl",
  "jwt_secret",
  "jwtsecret",
  "serpapi_api_key",
  "serpapi_key",
  "gemini_api_key",
  "gemini_model",
  "password",
  "passwordhash",
  "token",
  "secret",
  "authorization",
  "access_token",
  "refresh_token",
]);

/**
 * Redacts sensitive fields from objects or context dictionaries
 */
export function sanitizeContext(data: unknown, depth = 0): unknown {
  if (depth > 5 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Check if string contains connection strings or secrets
    if (data.includes("postgres://") || data.includes("postgresql://")) {
      return "[REDACTED_DATABASE_URL]";
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeContext(item, depth + 1));
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeContext(value, depth + 1);
      }
    }
    return sanitized;
  }

  return data;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = "info") {
    this.minLevel = minLevel;
  }

  public setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_SEVERITY[level] >= LOG_LEVEL_SEVERITY[this.minLevel];
  }

  private formatEntry(
    level: LogLevel,
    message: string,
    requestId?: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (requestId) {
      entry.requestId = requestId;
    }

    if (context && Object.keys(context).length > 0) {
      entry.context = sanitizeContext(context) as Record<string, unknown>;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const json = JSON.stringify(entry);
    if (entry.level === "error") {
      console.error(json);
    } else if (entry.level === "warn") {
      console.warn(json);
    } else {
      console.log(json);
    }
  }

  public debug(message: string, requestId?: string, context?: Record<string, unknown>): void {
    if (this.shouldLog("debug")) {
      this.output(this.formatEntry("debug", message, requestId, context));
    }
  }

  public info(message: string, requestId?: string, context?: Record<string, unknown>): void {
    if (this.shouldLog("info")) {
      this.output(this.formatEntry("info", message, requestId, context));
    }
  }

  public warn(
    message: string,
    requestId?: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (this.shouldLog("warn")) {
      this.output(this.formatEntry("warn", message, requestId, context, error));
    }
  }

  public error(
    message: string,
    requestId?: string,
    context?: Record<string, unknown>,
    error?: Error,
  ): void {
    if (this.shouldLog("error")) {
      this.output(this.formatEntry("error", message, requestId, context, error));
    }
  }
}

export const logger = new Logger(process.env.NODE_ENV === "production" ? "info" : "debug");
