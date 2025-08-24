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
exports.walletController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const wallet_service_1 = require("./wallet.service");
const myWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const wallet = yield wallet_service_1.walletService.myWallet(userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Your wallet retrieved successfully!",
        data: wallet,
    });
}));
const getAllWallets = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield wallet_service_1.walletService.getAllWallets(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "All wallets retrieved successfully!",
        data: info.wallets,
        meta: info.meta,
    });
}));
const getSingleWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = req.params.walletId;
    const info = yield wallet_service_1.walletService.getSingleWallet(walletId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Wallet retrieved successfully!",
        data: info,
    });
}));
const againstWalletAction = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    yield wallet_service_1.walletService.againstWalletAction(payload);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        success: true,
        message: "Take action successfully!",
        data: {},
    });
}));
const deposit = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield wallet_service_1.walletService.deposit(req);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        message: "Deposit Success.",
        data: transaction,
    });
}));
const withdraw = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield wallet_service_1.walletService.withdraw(req);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        message: "Cash out Success.",
        data: transaction,
    });
}));
const P2P = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield wallet_service_1.walletService.P2P(req);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        message: "Send money success.",
        data: transaction,
    });
}));
exports.walletController = {
    myWallet,
    getAllWallets,
    getSingleWallet,
    againstWalletAction,
    deposit,
    withdraw,
    P2P,
};
