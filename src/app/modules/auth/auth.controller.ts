import { envVars } from "../../config/env.config";
import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setToken";
import { authService } from "./auth.service";

const login = catchAsync(async (req, res) => {
  const response = await authService.login(req.body, req);
  setAuthCookie(res, response.userToken);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Your login successfully.",
    data: { user: response.user, ...response.userToken },
  });
});

const getNewAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const token = await authService.getNewAccessToken(refreshToken);
  setAuthCookie(res, token);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Successfully get new access token",
    data: token,
  });
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: envVars.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: envVars.NODE_ENV === "production",
  });
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "User logout successfully!",
    data: null,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;
  const changePasswordOTP = await authService.changePassword(
    userId,
    oldPassword,
    newPassword
  );
  // res.redirect("http://localhost:5000/change-password/verify-otp")
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Send change password OTP successfully!",
    data: changePasswordOTP,
  });
});

const verifyChangePasswordOtp = catchAsync(async (req, res) => {
  const userToken = await authService.verifyChangePSotp(req);
  setAuthCookie(res, userToken);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Password changed successfully!",
    data: null,
  });
});

export const authController = {
  login,
  getNewAccessToken,
  logout,
  changePassword,
  verifyChangePasswordOtp,
};
