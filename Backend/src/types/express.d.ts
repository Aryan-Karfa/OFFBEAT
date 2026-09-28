import "express";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      logContext?: Record<string, unknown>;
    }
  }
}
