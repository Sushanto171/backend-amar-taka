import { Router } from "express";

import { validateRequest } from "../../middlewares/validateZodSchema";
import { otpController } from "./opt.controller";
import { sendOTPZodSchema, verifyOTPZodSchema } from "./otp.validation";

const router = Router();

router.post(
  "/send",
  validateRequest(sendOTPZodSchema),
  otpController.sendVerifyOTP
);

router.post(
  "/verify",
  validateRequest(verifyOTPZodSchema),
  otpController.verifyOTP
);

export const OtpRoutes = router;
