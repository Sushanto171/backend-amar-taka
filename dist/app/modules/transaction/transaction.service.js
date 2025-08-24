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
exports.transactionService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = require("../../errorHelpers/AppError");
const checkToUserWithWallet_1 = require("../../utils/checkToUserWithWallet");
const checkTransactionTypeWithRole_1 = require("../../utils/checkTransactionTypeWithRole");
const https_status_codes_1 = require("../../utils/https-status-codes");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const auditLogs_interface_1 = require("../auditLogs/auditLogs.interface");
const eventBus_1 = require("../event/eventBus");
const user_model_1 = require("../user/user.model");
const transaction_interface_1 = require("./transaction.interface");
const transaction_model_1 = require("./transaction.model");
const createTransaction = (req, payload, c_session) => __awaiter(void 0, void 0, void 0, function* () {
    let session;
    if (c_session) {
        session = c_session;
    }
    else {
        session = yield (0, mongoose_1.startSession)();
        session.startTransaction();
    }
    let toUserInfo;
    let transaction;
    try {
        if (!payload.toWallet) {
            (0, checkTransactionTypeWithRole_1.checkSameNumber)(req); //fromUser.phone !== toUser.phone
            (0, checkTransactionTypeWithRole_1.checkTransactionTypeWithRole)(req.user.role, payload);
            toUserInfo = yield (0, checkToUserWithWallet_1.checkToUserWithWallet)(payload, session);
        }
        const transPayload = {
            fromWallet: payload.fromWallet,
            phone: payload.phone,
            toWallet: (payload === null || payload === void 0 ? void 0 : payload.toWallet) || (toUserInfo && toUserInfo.wallet),
            amount: payload.amount,
            reference: payload.reference,
            status: (payload === null || payload === void 0 ? void 0 : payload.status) || transaction_interface_1.ITransactionStatus.PENDING,
            type: payload.type,
            fee: (payload === null || payload === void 0 ? void 0 : payload.fee) || 0,
        };
        const transactionArray = yield transaction_model_1.Transaction.create([transPayload], {
            session,
        });
        transaction = transactionArray[0].toObject();
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: (payload === null || payload === void 0 ? void 0 : payload.type) ||
                    auditLogs_interface_1.IAuditActionType.CASH_IN,
                targetWallet: (payload === null || payload === void 0 ? void 0 : payload.toWallet) ||
                    (toUserInfo && toUserInfo.user.wallet),
                actor: payload.userId,
                actorWallet: payload.fromWallet,
                status: (payload === null || payload === void 0 ? void 0 : payload.status) || transaction_interface_1.ITransactionStatus.PENDING,
                metadata: {
                    amount: payload.amount,
                    transactionId: transaction._id,
                },
            },
        });
        if (!c_session) {
            yield session.commitTransaction();
            yield session.endSession();
        }
        return transaction;
    }
    catch (error) {
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: payload.type,
                targetWallet: (payload === null || payload === void 0 ? void 0 : payload.toWallet) ||
                    (toUserInfo && toUserInfo.user.wallet),
                actor: payload.userId,
                actorWallet: payload.fromWallet,
                status: transaction_interface_1.ITransactionStatus.FAILED,
                metadata: {
                    amount: payload.amount,
                    transactionId: transaction === null || transaction === void 0 ? void 0 : transaction._id,
                    message: error.message,
                },
            },
        });
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
});
const getAllTransactions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find(), query);
    const transaction = queryBuilder
        .filter()
        .search(["phone", "reference"])
        .fields()
        .sort()
        .paginate();
    const [trans, meta] = yield Promise.all([
        transaction.build(),
        transaction.getMeta(),
    ]);
    return { trans, meta };
});
const getTransactionByUserId = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("wallet");
    if (!user) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found");
    }
    const queryBuilder = new QueryBuilder_1.QueryBuilder(transaction_model_1.Transaction.find({
        $or: [{ toWallet: user.wallet }, { fromWallet: user.wallet }],
    }), query);
    const transaction = queryBuilder
        .filter()
        .search(["phone", "reference"])
        .fields()
        .sort()
        .paginate();
    const [trans, meta] = yield Promise.all([
        transaction.build(),
        transaction.getMeta(true),
    ]);
    return { trans, meta };
});
const getSingleTransaction = (transId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield transaction_model_1.Transaction.findById(transId);
    return transaction;
});
exports.transactionService = {
    createTransaction,
    getAllTransactions,
    getTransactionByUserId,
    getSingleTransaction,
};
