import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../lib/errors/AppError.js";
import { ERROR_CODES } from "../lib/errors/errorCodes.js";
import { sendError } from "../lib/http/response.js";
import { logger } from "../lib/logger/logger.js";
import type { ApiErrorDetail } from "@offbeat/shared";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const requestId = req.requestId || "unknown_req";

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const details: ApiErrorDetail[] = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    logger.warn(`Validation failure on ${req.method} ${req.originalUrl}`, requestId, { details });

    sendError(
      res,
      {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Invalid request payload or parameters",
        details,
      },
      400,
    );
    return;
  }

  // 2. Malformed JSON Body (SyntaxError from express.json())
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    logger.warn(`Malformed JSON payload on ${req.method} ${req.originalUrl}`, requestId);
    sendError(
      res,
      {
        code: ERROR_CODES.BAD_REQUEST,
        message: "Malformed JSON payload in request body",
        details: [{ message: "Unable to parse JSON request body" }],
      },
      400,
    );
    return;
  }

  // 3. Controlled Domain AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(
        `Application error on ${req.method} ${req.originalUrl}: ${err.message}`,
        requestId,
        {
          code: err.code,
          details: err.details,
        },
        err,
      );
    } else {
      logger.warn(`Client error on ${req.method} ${req.originalUrl}: ${err.message}`, requestId, {
        code: err.code,
        details: err.details,
      });
    }

    sendError(
      res,
      {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      err.statusCode,
    );
    return;
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn(
      `Prisma request error [${err.code}] on ${req.method} ${req.originalUrl}`,
      requestId,
      {
        prismaCode: err.code,
      },
    );

    if (err.code === "P2002") {
      // Unique constraint violation
      const target = Array.isArray(err.meta?.target)
        ? (err.meta.target as string[]).join(", ")
        : "field";
      sendError(
        res,
        {
          code: ERROR_CODES.CONFLICT,
          message: `A record with this ${target} already exists.`,
          details: [{ field: target, message: "Duplicate value violates unique constraint" }],
        },
        409,
      );
      return;
    }

    if (err.code === "P2025") {
      // Record not found
      sendError(
        res,
        {
          code: ERROR_CODES.NOT_FOUND,
          message: "The requested record was not found in the database.",
          details: [],
        },
        404,
      );
      return;
    }

    // Generic DB error (mask internal details)
    sendError(
      res,
      {
        code: ERROR_CODES.DATABASE_ERROR,
        message: "A database error occurred while processing the request.",
        details: [],
      },
      500,
    );
    return;
  }

  // 4. Prisma Initialization / Connection Errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    logger.error("Prisma database connection failed", requestId, {}, err);
    sendError(
      res,
      {
        code: ERROR_CODES.DATABASE_ERROR,
        message: "Database service is currently unreachable.",
        details: [],
      },
      503,
    );
    return;
  }

  // 5. Unhandled / Unexpected Errors
  const fallbackMessage = err instanceof Error ? err.message : "An unexpected error occurred";
  logger.error(
    `Unhandled error on ${req.method} ${req.originalUrl}: ${fallbackMessage}`,
    requestId,
    {},
    err instanceof Error ? err : undefined,
  );

  sendError(
    res,
    {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "Internal server error",
      details: [],
    },
    500,
  );
};
