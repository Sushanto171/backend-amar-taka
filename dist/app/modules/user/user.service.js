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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const mongoose_1 = require("mongoose");
const env_config_1 = require("../../config/env.config");
const AppError_1 = require("../../errorHelpers/AppError");
const bcryptjs_1 = require("../../utils/bcryptjs");
const redis_config_1 = require("../../config/redis.config");
const generateOTP_1 = require("../../utils/generateOTP");
const https_status_codes_1 = require("../../utils/https-status-codes");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const auditLogs_interface_1 = require("../auditLogs/auditLogs.interface");
const eventBus_1 = require("../event/eventBus");
const transaction_interface_1 = require("../transaction/transaction.interface");
const wallet_service_1 = require("./../wallet/wallet.service");
const user_model_1 = require("./user.model");
const createUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    try {
        const isUserExist = yield user_model_1.User.findOne({ phone: payload.phone });
        if (isUserExist) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "User already exist.");
        }
        payload.password = yield (0, bcryptjs_1.hashPassword)(payload.password, env_config_1.envVars.BCRYPT_SALT_ROUND);
        const userArray = yield user_model_1.User.create([payload], { session });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _a = userArray[0].toObject(), { password } = _a, user = __rest(_a, ["password"]);
        const wallet = yield wallet_service_1.walletService.createWallet(req, user, session);
        yield user_model_1.User.findByIdAndUpdate(user._id, { wallet: wallet._id }, { session });
        yield session.commitTransaction();
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.REGISTRATION_USER,
                actor: user._id,
                actorWallet: wallet._id,
                status: transaction_interface_1.ITransactionStatus.SUCCESS,
                metadata: { message: "User registration success." },
            },
        });
        return { user };
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
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
        userNumber: phone,
    });
    return { otp };
});
const verifyOTP = (phone, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findOne({ phone });
    if (!isUserExist) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found");
    }
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
    isUserExist.isVerified = true;
    yield isUserExist.save();
    return null;
});
const getAllUsers = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query);
    const user = queryBuilder
        .filter()
        .search(["name", "phone", "address", "role"])
        .sort()
        .fields()
        .paginate();
    const [users, metaData] = yield Promise.all([user.build(), user.getMeta()]);
    return { users, metaData };
});
const getSingleUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    if (!user) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not exist.");
    }
    return user;
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findById(userId).populate("wallet");
    if (!isUserExist) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found!");
    }
    return isUserExist;
});
const updateUser = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findById(userId).select("-password");
    if (!isUserExist) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not exist.");
    }
    const user = yield user_model_1.User.findByIdAndUpdate(userId, payload, {
        runValidators: true,
        new: true,
    });
    return user;
});
exports.userService = {
    createUser,
    sendVerifyOTP,
    verifyOTP,
    getAllUsers,
    getSingleUser,
    getMe,
    updateUser,
};
