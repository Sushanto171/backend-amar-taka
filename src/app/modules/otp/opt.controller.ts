import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { otpService } from "./otp.service";

const sendVerifyOTP = catchAsync(async (req: Request, res: Response) => {
  const phone = req.body.phone;
  const otp = await otpService.sendVerifyOTP(phone);
  sendResponse(res, {
    statusCode: httpsStatusCodes.CREATED,
    success: true,
    message: "User registered successfully!",
    data: otp,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { otp, phone } = req.body;
  await otpService.verifyOTP(phone, otp);
  sendResponse(res, {
    statusCode: httpsStatusCodes.CREATED,
    success: true,
    message: "Your account verified successfully!",
    data: null,
  });
});

export const otpController = {
  sendVerifyOTP,
  verifyOTP,
};
