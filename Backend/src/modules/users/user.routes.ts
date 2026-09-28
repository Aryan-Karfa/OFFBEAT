import { Router } from "express";
import { userController } from "./user.controller.js";
import { validateRequest } from "../../middleware/validation.middleware.js";
import { createUserSchema, getUserParamsSchema } from "./user.schema.js";

export const userRoutes: Router = Router();

userRoutes.get("/", userController.listUsers);
userRoutes.get("/:id", validateRequest({ params: getUserParamsSchema }), userController.getUser);
userRoutes.post("/", validateRequest({ body: createUserSchema }), userController.createUser);
