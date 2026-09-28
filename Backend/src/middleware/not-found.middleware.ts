import type { Request, Response } from "express";
import { ERROR_CODES } from "../lib/errors/errorCodes.js";
import { sendError } from "../lib/http/response.js";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    {
      code: ERROR_CODES.NOT_FOUND,
      message: `Cannot ${req.method} ${req.originalUrl}`,
      details: [{ message: "Route does not exist on this API" }],
    },
    404,
  );
}
