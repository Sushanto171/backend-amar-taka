import { Request } from "express";
import { startSession } from "mongoose";
import { AppError } from "../../errorHelpers/AppError";
import { comparePassword } from "../../utils/bcryptjs";
import { createUserTokens } from "../../utils/jwt";
import { temporarilyLockAccount } from "../../utils/temporarilyLockAccount";
import {
  IAuditActionType,
  IAuditStatus,
} from "../auditLogs/auditLogs.interface";
import { auditLogsService } from "../auditLogs/auditLogs.service";
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

export const authService = {
  login,
};
