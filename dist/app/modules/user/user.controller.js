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
exports.userController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const user_service_1 = require("./user.service");
const createUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_service_1.userService.createUser(req);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        success: true,
        message: "User registered successfully!",
        data: user,
    });
}));
const verifyOTP = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, phone } = req.body;
    yield user_service_1.userService.verifyOTP(phone, otp);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        success: true,
        message: "Your account verified successfully!",
        data: null,
    });
}));
const getAllUsers = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield user_service_1.userService.getAllUsers(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        success: true,
        message: "User retrieved successfully!",
        data: info.users,
        meta: info.metaData,
    });
}));
const getSingleUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield user_service_1.userService.getSingleUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        success: true,
        message: "User retrieved successfully!",
        data: user,
    });
}));
const getMe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const userInfo = yield user_service_1.userService.getMe(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        success: true,
        message: "Your Profile retrieved successfully!",
        data: userInfo,
    });
}));
const updateUser = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    const user = yield user_service_1.userService.updateUser(userId, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        success: true,
        message: "User profile updated successfully!",
        data: user,
    });
}));
exports.userController = {
    createUser,
    verifyOTP,
    getAllUsers,
    getSingleUser,
    getMe,
    updateUser,
};
