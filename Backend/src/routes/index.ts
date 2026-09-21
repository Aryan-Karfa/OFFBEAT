import { Router } from "express";
import type { Router as IRouter, Request, Response } from "express";
import type { ApiResponse, HealthStatus } from "@offbeat/types";

export const apiRouter: IRouter = Router();

apiRouter.get("/health", (req: Request, res: Response) => {
  const response: ApiResponse<HealthStatus> = {
    success: true,
    data: {
      status: "ok",
      version: "0.1.0",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    meta: {
      requestId: req.id || "req_health",
      timestamp: new Date().toISOString(),
    },
  };

  res.status(200).json(response);
});
