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
          "unAuthorized access!"
        );
      }

      if (isUserExist.isSuspended) {
        throw new AppError(
          httpsStatusCodes.FORBIDDEN,
          "Access denied. Please contact support."
        );
      }

      if (isUserExist.failedLoginAttempts && isUserExist.lockUntil) {
        if (
          isUserExist.failedLoginAttempts >= 3 ||
          new Date(isUserExist.lockUntil).getTime() > Date.now()
        ) {
          throw new AppError(
            httpsStatusCodes.FORBIDDEN,
            "Your account has been temporarily locked due to multiple failed login attempts. Please try again later or contact support."
          );
        }
      }
      req.user = {
        userId: isUserExist._id,
        role: isUserExist.role,
        phone: isUserExist.phone,
        email: isUserExist.email,
        wallet: isUserExist.wallet,
        agent: isUserExist.agent,
      };
      next();
    } catch (error: any) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, error.message);
    }
  };
