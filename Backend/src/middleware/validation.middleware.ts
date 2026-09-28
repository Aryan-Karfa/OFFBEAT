import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject, ZodEffects } from "zod";

type SupportedZodSchema = AnyZodObject | ZodEffects<AnyZodObject>;

export interface RequestValidationSchemas {
  body?: SupportedZodSchema;
  query?: SupportedZodSchema;
  params?: SupportedZodSchema;
}

export function validateRequest(schemas: RequestValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = (await schemas.query.parseAsync(req.query)) as Request["query"];
      }
      if (schemas.params) {
        req.params = (await schemas.params.parseAsync(req.params)) as Request["params"];
      }
      next();
    } catch (error) {
      // Forward Zod error directly to the central error middleware
      next(error);
    }
  };
}
