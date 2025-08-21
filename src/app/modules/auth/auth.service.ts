import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { startSession } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { comparePassword } from "../../utils/bcryptjs";
import { checkUserWithWallet } from "../../utils/checkUserWithWallet";
import { createUserTokens, generateToken, verifyToken } from "../../utils/jwt";
import { temporarilyLockAccount } from "../../utils/temporarilyLockAccount";
import {
  IAuditActionType,
  IAuditStatus,
} from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
import { eventBus } from "../event/eventBus";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import { httpsStatusCodes } from "./../../utils/https-status-codes";

const login = async (
  payload: Pick<IUser, "password" | "phone">,
  req: Request
) => {
  const session = await startSession();
  session.startTransaction();

  const isUserExist = await User.findOne({ phone: payload.phone })
    .select("+password")
    .session(session);

  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "User does not exist");
  }

  const date = Date.now();
  if (
    isUserExist.lockUntil &&
    isUserExist.lockUntil !== null &&
    isUserExist.lockUntil >= date
  ) {
    await session.endSession();
    throw new AppError(
      httpsStatusCodes.METHOD_NOT_ALLOWED,
      "Your account has been temporarily locked due to multiple failed login attempts. Please try again later or contact support."
    );
  }

  const matchedPassword = await comparePassword(
    isUserExist.password,
    payload.password
  );

  if (!matchedPassword) {
    await auditLogsService.createAuditLog({
      req,
      payload: {
        actor: isUserExist._id,
        action: IAuditActionType.LOG_IN,
        status: IAuditStatus.FAILED,
      },
      session,
    });
    await temporarilyLockAccount(isUserExist._id, session);
  }

  if (isUserExist.isSuspended || isUserExist.isDeleted) {
    await session.endSession();
    throw new AppError(
      httpsStatusCodes.FORBIDDEN,
      "Access denied. Please contact support."
    );
  }

  isUserExist.failedLoginAttempts = 0;
  isUserExist.lockUntil = null;

  await isUserExist.save({ session });

  const userToken = createUserTokens(isUserExist);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = isUserExist.toObject();

  await auditLogsService.createAuditLog({
    req,
    payload: {
      actor: isUserExist._id,
      action: IAuditActionType.LOG_IN,
      status: IAuditStatus.SUCCESS,
    },
    session,
  });

  await session.commitTransaction();
  await session.endSession();

  eventBus.emit("sendSms", {
    timeStamp: new Date(),
    message: "Log in success!",
  });

  return {
    user: {
      _id: user._id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    },
    userToken,
  };
};

const getNewAccessToken = async (refreshToken: string) => {
  const decoded = verifyToken(
    refreshToken,
    envVars.JWT.JWT_REFRESH_SECRET
  ) as JwtPayload;
  const isUserExist = await User.findById(decoded.userId);
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
  }
  checkUserWithWallet(isUserExist);
  const jwtPayload = {
    role: isUserExist.role,
    userId: isUserExist._id,
    phone: isUserExist.phone,
    email: isUserExist.email,
  };
  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT.JWT_ACCESS_SECRET,
    envVars.JWT.JWT_ACCESS_EXPIRATION
  );
  return { accessToken, refreshToken };
};

export const authService = {
  login,
  getNewAccessToken,
};
