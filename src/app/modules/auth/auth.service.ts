import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { startSession } from "mongoose";
import { envVars } from "../../config/env.config";
import { redisClient } from "../../config/redis.config";
import { AppError } from "../../errorHelpers/AppError";
import { comparePassword, hashPassword } from "../../utils/bcryptjs";
import { checkUserWithWallet } from "../../utils/checkUserWithWallet";
import { generateOTP } from "../../utils/generateOTP";
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

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const isUserExist = await User.findById(userId).select("+password");
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
  }
  checkUserWithWallet(isUserExist); //check user

  const matchedPassword = await comparePassword(
    isUserExist.password,
    oldPassword
  );
  if (!matchedPassword) {
    throw new AppError(
      httpsStatusCodes.BAD_REQUEST,
      "Password does not matched."
    );
  }

  const newHashedPassword = await hashPassword(
    newPassword,
    envVars.BCRYPT_SALT_ROUND
  );
  const randomOTP = generateOTP(6);
  const redisOTPKey = `otp:${isUserExist.phone}`;
  const redisPwcdKey = `pwcd:${isUserExist.phone}`;
  await redisClient.set(redisOTPKey, randomOTP, {
    expiration: { type: "EX", value: 120 },
  });
  await redisClient.set(redisPwcdKey, newHashedPassword, {
    expiration: { type: "EX", value: 300 },
  });

  const OTP = await redisClient.get(redisOTPKey);
  eventBus.emit("sendSms", {
    userNumber: isUserExist.phone,
    timeStamp: new Date(),
    otpCode: randomOTP,
    message: `Your change password OTP is:${randomOTP}`,
  });
  return { OTP };
};

const verifyChangePSotp = async (req: Request) => {
  const userId = req.user.userId;
  const otp = req.body.otp;
  const isUserExist = await User.findById(userId).select("+password");
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
  }
  const redisOTPKey = `otp:${isUserExist.phone}`;
  const redisPwcdKey = `pwcd:${isUserExist.phone}`;
  const redisOTPPromise = redisClient.get(redisOTPKey);
  const redisPwddPromise = redisClient.get(redisPwcdKey);
  const [redisOTP, redisHashedPassword] = await Promise.all([
    redisOTPPromise,
    redisPwddPromise,
  ]);
  if (!redisOTP || !redisHashedPassword) {
    throw new AppError(httpsStatusCodes.NOT_ACCEPTABLE, "OTP is expired.");
  }

  if (redisOTP !== otp) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "OTP is invalid.");
  }

  isUserExist.password = redisHashedPassword;
  await isUserExist.save();
  await redisClient.del(redisOTPKey);
  await redisClient.del(redisPwcdKey);
  const token = createUserTokens(isUserExist);

  await auditLogsService.createAuditLog({
    req,
    payload: {
      action: IAuditActionType.PASSWORD_CHANGE,
      actor: isUserExist._id,
      status: IAuditStatus.SUCCESS,
    },
  });
  return token;
};

const forgetPassword = async (phone: string) => {
  const isUserExist = await User.findOne({ phone });
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
  }
  const otp = generateOTP(6);
  const redisKey = `otp:forget${isUserExist.phone}`;
  await redisClient.set(redisKey, otp, {
    expiration: { type: "EX", value: 120 },
  });
  eventBus.emit("sendSms", {
    userNumber: isUserExist.phone,
    timeStamp: new Date(),
    otpCode: otp,
    message: `Your OTP is:${otp}`,
  });
  return { otp };
};

const resetPassword = async (req: Request) => {
  const { otp, phone, password } = req.body;
  const isUserExist = await User.findOne({ phone }).select("+password");
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
  }
  const redisOTPKey = `otp:forget${isUserExist.phone}`;

  const redisOTP = await redisClient.get(redisOTPKey);

  if (!redisOTP) {
    throw new AppError(httpsStatusCodes.NOT_ACCEPTABLE, "OTP is expired.");
  }

  if (redisOTP !== otp) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "OTP is invalid.");
  }
  const hashedPassword = await hashPassword(
    password,
    envVars.BCRYPT_SALT_ROUND
  );

  isUserExist.password = hashedPassword;
  await isUserExist.save();
  await redisClient.del(redisOTPKey);

  await auditLogsService.createAuditLog({
    req,
    payload: {
      action: IAuditActionType.PASSWORD_CHANGE,
      actor: isUserExist._id,
      status: IAuditStatus.SUCCESS,
    },
  });
  return null;
};

export const authService = {
  login,
  getNewAccessToken,
  changePassword,
  verifyChangePSotp,
  forgetPassword,
  resetPassword,
};
