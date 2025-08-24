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
exports.transactionController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const transaction_service_1 = require("./transaction.service");
const createTransaction = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    req.body = Object.assign(Object.assign({}, req.body), { fromWallet: req.user.wallet, userId: req.user.userId });
    const transaction = yield transaction_service_1.transactionService.createTransaction(req, req.body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.CREATED,
        message: "Transaction created Successfully.",
        data: transaction,
    });
}));
const getAllTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield transaction_service_1.transactionService.getAllTransactions(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "All Transaction Retrieved Successfully.",
        data: info.trans,
        meta: info.meta,
    });
}));
const getTransactionByUserId = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const info = yield transaction_service_1.transactionService.getTransactionByUserId(userId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "All Transaction Retrieved Successfully.",
        data: info.trans,
        meta: info.meta,
    });
}));
const getSingleTransaction = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const transId = req.params.transactionId;
    const transactions = yield transaction_service_1.transactionService.getSingleTransaction(transId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Transaction Retrieved Successfully.",
        data: transactions,
    });
}));
exports.transactionController = {
    createTransaction,
    getAllTransactions,
    getTransactionByUserId,
    getSingleTransaction,
};
