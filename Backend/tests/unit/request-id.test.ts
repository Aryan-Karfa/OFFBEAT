import { describe, it, expect, vi } from "vitest";
import { requestIdMiddleware } from "../../src/middleware/request-id.middleware.js";
import type { Request, Response, NextFunction } from "express";

describe("Request ID Middleware", () => {
  it("should generate a new request ID if none is supplied", () => {
    const req = {
      header: vi.fn().mockReturnValue(undefined),
    } as unknown as Request;

    const setHeaderMock = vi.fn();
    const res = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId.startsWith("req_")).toBe(true);
    expect(setHeaderMock).toHaveBeenCalledWith("X-Request-ID", req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it("should preserve client-supplied valid request ID", () => {
    const existingId = "client-trace-12345678";
    const req = {
      header: vi.fn().mockReturnValue(existingId),
    } as unknown as Request;

    const setHeaderMock = vi.fn();
    const res = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe(existingId);
    expect(setHeaderMock).toHaveBeenCalledWith("X-Request-ID", existingId);
    expect(next).toHaveBeenCalled();
  });
});
