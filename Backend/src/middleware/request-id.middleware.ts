import type { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.header("X-Request-ID");

  // Accept valid client-provided alphanumeric/UUID request IDs or generate a new one
  const requestId =
    existingId && /^[a-zA-Z0-9_-]{8,64}$/.test(existingId)
      ? existingId
      : `req_${uuidv4().replace(/-/g, "")}`;

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
}
