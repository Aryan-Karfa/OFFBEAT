import type { Request, Response, NextFunction } from "express";
import { userService, type UserService } from "./user.service.js";
import { sendSuccess } from "../../lib/http/response.js";

export class UserController {
  constructor(private service: UserService = userService) {}

  getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.service.getUserById(req.params.id as string);
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newUser = await this.service.createUser(req.body);
      sendSuccess(res, newUser, 201);
    } catch (error) {
      next(error);
    }
  };

  listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
      const users = await this.service.listUsers(limit, offset);
      sendSuccess(res, users, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController();
