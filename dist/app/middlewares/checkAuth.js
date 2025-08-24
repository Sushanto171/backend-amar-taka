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
exports.checkAuth = void 0;
const env_config_1 = require("../config/env.config");
const AppError_1 = require("../errorHelpers/AppError");
const user_model_1 = require("../modules/user/user.model");
const https_status_codes_1 = require("../utils/https-status-codes");
const jwt_1 = require("../utils/jwt");
const checkAuth = (authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken;
        if (!token) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "Missing user token");
        }
        const verifiedToken = (0, jwt_1.verifyToken)(token, env_config_1.envVars.JWT.JWT_ACCESS_SECRET);
        const isUserExist = yield user_model_1.User.findById(verifiedToken.userId);
        if (!isUserExist) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not exist.");
        }
        if (!authRoles.includes(isUserExist.role)) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.UNAUTHORIZED, "unAuthorized access!");
        }
        if (isUserExist.isSuspended) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.FORBIDDEN, "Access denied. Please contact support.");
        }
        if (isUserExist.failedLoginAttempts && isUserExist.lockUntil) {
            if (isUserExist.failedLoginAttempts >= 3 ||
                new Date(isUserExist.lockUntil).getTime() > Date.now()) {
                throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.FORBIDDEN, "Your account has been temporarily locked due to multiple failed login attempts. Please try again later or contact support.");
            }
        }
        req.user = {
            userId: isUserExist._id,
            role: isUserExist.role,
            phone: isUserExist.phone,
            email: isUserExist.email,
            wallet: isUserExist.wallet,
            agent: isUserExist.agent,
        };
        next();
    }
    catch (error) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, error.message);
    }
});
exports.checkAuth = checkAuth;
