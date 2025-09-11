import { Request } from "express";
import { startSession, Types } from "mongoose";
import { envVars } from "../../config/env.config";
import { redisClient } from "../../config/redis.config";
import { AppError } from "../../errorHelpers/AppError";
import { generateOTP } from "../../utils/generateOTP";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { updateSystemWallet } from "../../utils/updateSystemWallet";
import { eventBus } from "../event/eventBus";
import {
  ITransaction,
  ITransactionStatus,
  ITransactionType,
} from "../transaction/transaction.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

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
    receiverNumber: phone,
  });
  return { otp };
};

const verifyOTP = async (req: Request) => {
  const { otp, phone } = req.body;
  const isUserExist = await User.findOne({ phone });
  if (!isUserExist) {
    throw new AppError(httpsStatusCodes.NOT_FOUND, "User does not found");
  }
  if (isUserExist.isVerified) {
    throw new AppError(
      httpsStatusCodes.BAD_REQUEST,
      "You are already verified."
    );
  }
  const session = await startSession();
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
  session.startTransaction();

  isUserExist.isVerified = true;

  await isUserExist.save({ session });

  const system = await updateSystemWallet({
    session,
    amount: envVars.USER.USER_WELCOME_BONUS,
  });

  await Wallet.findByIdAndUpdate(
    isUserExist.wallet,
    {
      balance: envVars.USER.USER_WELCOME_BONUS,
    },
    { session }
  );
  const transactionPayload: ITransaction = {
    amount: envVars.USER.USER_WELCOME_BONUS, //paisa
    fromWallet: system?._id as Types.ObjectId,
    toWallet: isUserExist.wallet,
    receiver: isUserExist.phone as string,
    sender: envVars.ADMIN.ADMIN_PHONE,
    fee: 0,
    status: ITransactionStatus.SUCCESS,
    type: ITransactionType.CASH_IN,
    reference: `welcome-bonus-${Date.now()}`,
  };
  eventBus.emit("transaction", { ...transactionPayload, req });

  await session.commitTransaction();
  await session.endSession();
  return null;
};

export const otpService = {
  sendVerifyOTP,
  verifyOTP,
};
