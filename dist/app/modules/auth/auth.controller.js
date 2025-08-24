"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const env_config_1 = require("../../config/env.config");
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const setToken_1 = require("../../utils/setToken");
const auth_service_1 = require("./auth.service");
const login = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield auth_service_1.authService.login(req.body, req);
    (0, setToken_1.setAuthCookie)(res, response.userToken);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Your login successfully.",
        data: Object.assign({ user: response.user }, response.userToken),
    });
}));
const getNewAccessToken = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    const token = yield auth_service_1.authService.getNewAccessToken(refreshToken);
    (0, setToken_1.setAuthCookie)(res, token);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Successfully get new access token",
        data: token,
    });
}));
const logout = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: env_config_1.envVars.NODE_ENV === "production",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "lax",
        secure: env_config_1.envVars.NODE_ENV === "production",
    });
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "User logout successfully!",
        data: null,
    });
}));
const changePassword = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    const changePasswordOTP = yield auth_service_1.authService.changePassword(userId, oldPassword, newPassword);
    // res.redirect("http://localhost:5000/change-password/verify-otp")
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Send change password OTP successfully!",
        data: changePasswordOTP,
    });
}));
const verifyChangePasswordOtp = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userToken = yield auth_service_1.authService.verifyChangePSotp(req);
    (0, setToken_1.setAuthCookie)(res, userToken);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Password changed successfully!",
        data: null,
    });
}));
const forgetPassword = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const changePasswordOTP = yield auth_service_1.authService.forgetPassword(req.body.phone);
    // res.redirect("http://localhost:5000/forget-password/verify-otp")
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Send OTP successfully!",
        data: changePasswordOTP,
    });
}));
const resetPassword = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield auth_service_1.authService.resetPassword(req);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Password reset successfully!",
        data: null,
    });
}));
exports.authController = {
    login,
    getNewAccessToken,
    logout,
    changePassword,
    verifyChangePasswordOtp,
    forgetPassword,
    resetPassword,
};
