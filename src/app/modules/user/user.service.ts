import { startSession } from "mongoose";
import { envVars } from "../../config/env.config";
import { AppError } from "../../errorHelpers/AppError";
import { hashPassword } from "../../utils/bcryptjs";

import { Request } from "express";
import { redisClient } from "../../config/redis.config";
import { generateOTP } from "../../utils/generateOTP";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IAuditActionType } from "../auditLogs/auditLogs.interface";
import { eventBus } from "../event/eventBus";
import { ITransactionStatus } from "../transaction/transaction.interface";
import { walletService } from "./../wallet/wallet.service";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import { actionType } from "./user.validator";

const createUser = async (req: Request) => {
  const payload: IUser = req.body;
  const session = await startSession();
  session.startTransaction();
  try {
    const isUserExist = await User.findOne({
      $or: [{ phone: payload.phone }, { phone: `+88${payload.phone}` }],
    });
    if (isUserExist) {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "User already exist.");
    }

    payload.password = await hashPassword(
      payload.password as string,
      envVars.BCRYPT_SALT_ROUND
    );

    const userArray = await User.create([payload], { session });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...user } = userArray[0].toObject();

    const wallet = await walletService.createWallet(req, user, session);

    await User.findByIdAndUpdate(user._id, { wallet: wallet._id }, { session });

    await session.commitTransaction();

    eventBus.emit("log", {
      req,
      payload: {
        action: IAuditActionType.REGISTRATION_USER,
        actor: user._id,
        actorWallet: wallet._id,
        status: ITransactionStatus.SUCCESS,
        metadata: { message: "User registration success." },
      },
    });
    return { user };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const sendVerifyOTP = async (phone: string) => {
  const otp = generateOTP(6);
  const redisKey = `otp:createUser-${phone}`;
  await redisClient.set(redisKey, otp, {
    expiration: { type: "EX", value: 120 },
  });

  eventBus.emit("sendSms", {
    timeStamp: new Date(),
    otpCode: otp,
    message: `Your OTP is: ${otp}`,
    userNumber: phone,
  });
  return { otp };
};

const verifyOTP = async (phone: string, otp: string) => {
  const isUserExist = await User.findOne({ phone });
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
  }
  const redisKey = `otp:createUser-${isUserExist.phone}`;
  const redisOtp = await redisClient.get(redisKey);
  if (!redisOtp) {
    throw new AppError(httpsStatusCodes.BAD_REQUEST, "OTP is expired");
  }
  if (redisOtp !== otp) {
    // development purpose
    if (otp !== "123456") {
      throw new AppError(httpsStatusCodes.BAD_REQUEST, "invalid OTP");
    }
  }
  isUserExist.isVerified = true;
  await isUserExist.save();
  return null;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const user = queryBuilder
    .filter()
    .search(["name", "phone", "address", "role"])
    .sort()
    .fields()
    .paginate();
  const [users, metaData] = await Promise.all([user.build(), user.getMeta()]);
  return { users, metaData };
};

const againstUserAction = async (payload: actionType) => {
  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found.");
  }
  user.isDeleted = payload.isDeleted;

  user.isSuspended = payload.isSuspended;

  await user.save({ validateBeforeSave: true });
  return null;
};

const getSingleUser = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
  }
  return user;
};

const getMe = async (userId: string) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found!");
  }

  return isUserExist;
};

const updateUser = async (userId: string, payload: Partial<IUser>) => {
  const isUserExist = await User.findById(userId).select("-password");
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not exist.");
  }

  const user = await User.findByIdAndUpdate(userId, payload, {
    runValidators: true,
    new: true,
  });

  return user;
};

export const userService = {
  createUser,
  verifyOTP,
  sendVerifyOTP,
  getAllUsers,
  againstUserAction,
  getSingleUser,
  getMe,
  updateUser,
};
