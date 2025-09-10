import { redisClient } from "../../config/redis.config";
import { AppError } from "../../errorHelpers/AppError";
import { generateOTP } from "../../utils/generateOTP";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { eventBus } from "../event/eventBus";
import { User } from "../user/user.model";

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

export const otpService = {
  sendVerifyOTP,
  verifyOTP,
};
