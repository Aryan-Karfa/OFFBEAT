import type { Request, Response, NextFunction } from "express";
import { ERROR_CODES } from "../lib/errors/errorCodes.js";
import { sendError } from "../lib/http/response.js";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitOptions {
  windowMs?: number; // window size in ms
  max?: number; // max requests per window
}

/**
 * Lightweight in-memory rate limiter foundation for Phase 4 proof-of-concept
 */
export function rateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60 * 1000; // 1 minute default
  const max = options.max ?? 100; // 100 req/min default

  const store = new Map<string, RateLimitRecord>();

  // Cleanup old entries every 5 minutes
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, record] of store.entries()) {
        if (now > record.resetTime) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  ).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // In dev/test or for internal health check, allow throughput without throttle
    if (process.env.NODE_ENV === "test" || req.path === "/health" || req.path.endsWith("/health")) {
      return next();
    }
    const clientKey = req.ip || req.socket.remoteAddress || "global_client";
    const now = Date.now();

    let record = store.get(clientKey);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(clientKey, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", max.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", resetSeconds.toString());

    if (record.count > max) {
      sendError(
        res,
        {
          code: ERROR_CODES.RATE_LIMITED,
          message: "Too many requests. Please slow down and try again later.",
          details: [{ message: `Exceeded ${max} requests per ${windowMs / 1000}s window` }],
        },
        429,
        { resetInSeconds: resetSeconds },
      );
      return;
    }

    next();
  };
}
