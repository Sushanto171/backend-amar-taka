/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { AppError } from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import { httpsStatusCodes } from "../utils/https-status-codes";

export const checkAuth =
  (authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isUserExist = await User.findById(req.user.userId);
      if (!isUserExist) {
        throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
      }
      if (!authRoles.includes(isUserExist.role)) {
        throw new AppError(
          httpsStatusCodes.UNAUTHORIZED,
          "unauthorized access"
        );
      }
      next();
    } catch (error: any) {
      console.log("authCheck error:", error);
      throw new AppError(httpsStatusCodes.BAD_REQUEST, error.message);
    }
  };
