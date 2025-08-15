/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env.config";
import { AppError } from "../errorHelpers/AppError";
import { User } from "../modules/user/user.model";
import { httpsStatusCodes } from "../utils/https-status-codes";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new AppError(httpsStatusCodes.NOT_FOUND, "Missing user token");
      }

      const verifiedToken = verifyToken(
        token,
        envVars.JWT.JWT_ACCESS_SECRET
      ) as JwtPayload;

      const isUserExist = await User.findById(verifiedToken.userId as string);

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
      throw new AppError(httpsStatusCodes.BAD_REQUEST, error.message);
    }
  };
