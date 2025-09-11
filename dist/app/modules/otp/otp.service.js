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
exports.otpService = void 0;
const mongoose_1 = require("mongoose");
const env_config_1 = require("../../config/env.config");
const redis_config_1 = require("../../config/redis.config");
const AppError_1 = require("../../errorHelpers/AppError");
const generateOTP_1 = require("../../utils/generateOTP");
const https_status_codes_1 = require("../../utils/https-status-codes");
const updateSystemWallet_1 = require("../../utils/updateSystemWallet");
const eventBus_1 = require("../event/eventBus");
const transaction_interface_1 = require("../transaction/transaction.interface");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const sendVerifyOTP = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = (0, generateOTP_1.generateOTP)(6);
    const redisKey = `otp:createUser-${phone}`;
    yield redis_config_1.redisClient.set(redisKey, otp, {
        expiration: { type: "EX", value: 120 },
    });
    eventBus_1.eventBus.emit("sendSms", {
        timeStamp: new Date(),
        otpCode: otp,
        message: `Your OTP is: ${otp}`,
        receiverNumber: phone,
    });
    return { otp };
});
const verifyOTP = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, phone } = req.body;
    const isUserExist = yield user_model_1.User.findOne({ phone });
    if (!isUserExist) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found");
    }
    if (isUserExist.isVerified) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "You are already verified.");
    }
    const session = yield (0, mongoose_1.startSession)();
    const redisKey = `otp:createUser-${isUserExist.phone}`;
    const redisOtp = yield redis_config_1.redisClient.get(redisKey);
    if (!redisOtp) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "OTP is expired");
    }
    if (redisOtp !== otp) {
        // development purpose
        if (otp !== "123456") {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "invalid OTP");
        }
    }
    session.startTransaction();
    isUserExist.isVerified = true;
    yield isUserExist.save({ session });
    const system = yield (0, updateSystemWallet_1.updateSystemWallet)({
        session,
        amount: env_config_1.envVars.USER.USER_WELCOME_BONUS,
    });
    yield wallet_model_1.Wallet.findByIdAndUpdate(isUserExist.wallet, {
        balance: env_config_1.envVars.USER.USER_WELCOME_BONUS,
    }, { session });
    const transactionPayload = {
        amount: env_config_1.envVars.USER.USER_WELCOME_BONUS, //paisa
        fromWallet: system === null || system === void 0 ? void 0 : system._id,
        toWallet: isUserExist.wallet,
        receiver: isUserExist.phone,
        sender: env_config_1.envVars.ADMIN.ADMIN_PHONE,
        fee: 0,
        status: transaction_interface_1.ITransactionStatus.SUCCESS,
        type: transaction_interface_1.ITransactionType.CASH_IN,
        reference: `welcome-bonus-${Date.now()}`,
    };
    eventBus_1.eventBus.emit("transaction", Object.assign(Object.assign({}, transactionPayload), { req }));
    yield session.commitTransaction();
    yield session.endSession();
    return null;
});
exports.otpService = {
    sendVerifyOTP,
    verifyOTP,
};
