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
exports.temporarilyLockAccount = void 0;
const env_config_1 = require("../config/env.config");
const AppError_1 = require("../errorHelpers/AppError");
const user_model_1 = require("../modules/user/user.model");
const https_status_codes_1 = require("./https-status-codes");
const temporarilyLockAccount = (userId, session) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, {
        $inc: { failedLoginAttempts: +1 },
    }, { new: true, runValidators: true, session });
    if (updatedUser &&
        updatedUser.failedLoginAttempts &&
        updatedUser.failedLoginAttempts >= 3) {
        updatedUser.lockUntil = Date.now() + env_config_1.envVars.ADMIN.LOCK_LOGIN_UNTIL;
        yield updatedUser.save({ session });
    }
    yield session.commitTransaction();
    throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "Invalid password");
});
exports.temporarilyLockAccount = temporarilyLockAccount;
