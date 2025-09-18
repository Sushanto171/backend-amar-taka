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
exports.walletService = void 0;
const mongoose_1 = require("mongoose");
const AppError_1 = require("../../errorHelpers/AppError");
const calculatePercent_1 = require("../../utils/calculatePercent");
const https_status_codes_1 = require("../../utils/https-status-codes");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const updateSystemWallet_1 = require("../../utils/updateSystemWallet");
const updateTransactionBalance_1 = require("../../utils/updateTransactionBalance");
const updateTransactionStatus_1 = require("../../utils/updateTransactionStatus");
const validateTransactionBeforeProcess_1 = require("../../utils/validateTransactionBeforeProcess");
const auditLogs_interface_1 = require("../auditLogs/auditLogs.interface");
const eventBus_1 = require("../event/eventBus");
const transaction_interface_1 = require("../transaction/transaction.interface");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const wallet_interface_1 = require("./wallet.interface");
const wallet_model_1 = require("./wallet.model");
const createWallet = (req, user, session) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletPayload = {
            balance: 0,
            user: user._id,
            type: wallet_interface_1.IWalletType.PERSONAL,
        };
        const walletArray = yield wallet_model_1.Wallet.create([walletPayload], { session });
        const wallet = walletArray[0].toObject();
        return wallet;
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
        throw error;
    }
});
const myWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield user_model_1.User.findById(userId).populate("wallet");
    if (!isUserExist) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not exist");
    }
    return isUserExist.wallet;
});
// admin route
const getAllWallets = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = new QueryBuilder_1.QueryBuilder(wallet_model_1.Wallet.find(), query)
        .filter()
        .fields()
        .sort()
        .paginate();
    const [wallets, meta] = yield Promise.all([wallet.build(), wallet.getMeta()]);
    return { wallets, meta };
});
const getSingleWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(walletId);
    if (!wallet) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "Wallet does not found");
    }
    return wallet;
});
const againstWalletAction = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(payload.walletId);
    if (!wallet) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "Wallet does not found");
    }
    wallet.isBlock = payload.isBlock;
    yield wallet.save({ validateBeforeSave: true });
    return null;
});
const deposit = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    let transaction;
    const agentWallet = req.user.wallet;
    const userId = req.user.userId;
    try {
        transaction = yield (0, validateTransactionBeforeProcess_1.validateTransactionBeforeProcess)(req, session, transaction_interface_1.ITransactionType.CASH_IN);
        if (transaction.amount > agentWallet.balance) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
        }
        const calculation = (0, calculatePercent_1.calculatePercent)({
            amount: transaction.amount,
            type: "DEPOSIT",
        });
        //update transaction status
        transaction = yield (0, updateTransactionStatus_1.updateTransactionStatus)(transaction, calculation.deductFee, session);
        // update to user wallet
        yield (0, updateTransactionBalance_1.updateTransactionBalance)({
            walletId: transaction.toWallet,
            balance: transaction.amount - calculation.deductFee,
            session: session,
            incType: updateTransactionBalance_1.IncType.increment,
        });
        // update from agent wallet
        yield (0, updateTransactionBalance_1.updateTransactionBalance)({
            walletId: transaction.fromWallet,
            balance: transaction.amount,
            session: session,
            incType: updateTransactionBalance_1.IncType.decrement,
            revenue: calculation.agentRevenue,
        });
        //create agent commission
        eventBus_1.eventBus.emit("commission", {
            commission: calculation.agentRevenue,
            user: req.user.userId,
            transaction: transaction._id,
        });
        // increment system revenue
        const systemWallet = yield (0, updateSystemWallet_1.updateSystemWallet)({
            revenue: calculation.systemRevenue,
            session,
        });
        //create system commission
        if (systemWallet) {
            eventBus_1.eventBus.emit("commission", {
                commission: calculation.systemRevenue,
                user: systemWallet.user,
                transaction: transaction._id,
            });
        }
        yield session.commitTransaction();
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.CASH_IN,
                targetWallet: transaction.toWallet,
                actor: userId,
                actorWallet: transaction.fromWallet,
                status: auditLogs_interface_1.IAuditStatus.SUCCESS,
                metadata: {
                    amount: transaction.amount,
                    transactionId: transaction._id,
                },
            },
        });
        eventBus_1.eventBus.emit("sendSms", {
            timeStamp: new Date(),
            message: "Cash in Success",
            senderNumber: transaction.sender,
            receiverNumber: transaction.receiver,
            fee: transaction.fee,
            amount: transaction.amount - Number(calculation.deductFee),
            reference: transaction.reference,
            transactionId: transaction._id.toHexString(),
        });
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        yield transaction_model_1.Transaction.findByIdAndUpdate(req.body.transactionId, {
            status: transaction_interface_1.ITransactionStatus.FAILED,
            metaData: { message: error.message },
        });
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.CASH_IN,
                targetWallet: transaction
                    ? transaction.toWallet
                    : undefined,
                actor: userId,
                actorWallet: agentWallet._id,
                status: auditLogs_interface_1.IAuditStatus.FAILED,
                metadata: {
                    amount: transaction ? transaction.amount : undefined,
                    message: error.message,
                },
            },
        });
        eventBus_1.eventBus.emit("sendSms", {
            message: error.message,
            senderNumber: transaction === null || transaction === void 0 ? void 0 : transaction.sender,
            receiverNumber: transaction === null || transaction === void 0 ? void 0 : transaction.receiver,
            timeStamp: new Date(),
        });
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const withdraw = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    let transaction;
    const userWallet = req.user.wallet;
    const userId = req.user.userId;
    try {
        transaction = yield (0, validateTransactionBeforeProcess_1.validateTransactionBeforeProcess)(req, session, transaction_interface_1.ITransactionType.CASH_OUT);
        const calculation = (0, calculatePercent_1.calculatePercent)({
            amount: transaction.amount,
            type: "WITHDRAW",
        });
        const costAmount = transaction.amount + calculation.deductFee;
        if (userWallet.balance < costAmount) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
        }
        //update transaction status
        transaction = yield (0, updateTransactionStatus_1.updateTransactionStatus)(transaction, calculation.deductFee, session);
        // update user wallet
        yield (0, updateTransactionBalance_1.updateTransactionBalance)({
            walletId: transaction.fromWallet,
            balance: costAmount,
            session: session,
            incType: updateTransactionBalance_1.IncType.decrement,
        });
        // update agent wallet
        yield (0, updateTransactionBalance_1.updateTransactionBalance)({
            walletId: transaction.toWallet,
            balance: transaction.amount,
            incType: updateTransactionBalance_1.IncType.increment,
            revenue: calculation.agentRevenue,
            session: session,
        });
        // create agent commission
        eventBus_1.eventBus.emit("commission", {
            commission: calculation.agentRevenue,
            user: transaction.toWallet,
            transaction: transaction._id,
        });
        // increment system revenue
        const systemWallet = yield (0, updateSystemWallet_1.updateSystemWallet)({
            revenue: calculation.systemRevenue,
            session,
        });
        //create system commission
        if (systemWallet) {
            eventBus_1.eventBus.emit("commission", {
                commission: calculation.systemRevenue,
                user: systemWallet.user,
                transaction: transaction._id,
            });
        }
        yield session.commitTransaction();
        // create withdraw log
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.CASH_OUT,
                targetWallet: transaction.toWallet,
                actor: userId,
                actorWallet: transaction.fromWallet,
                status: auditLogs_interface_1.IAuditStatus.SUCCESS,
                metadata: {
                    amount: transaction.amount,
                    transactionId: transaction._id,
                },
            },
        });
        eventBus_1.eventBus.emit("sendSms", {
            timeStamp: new Date(),
            message: "Cash out Success",
            senderNumber: transaction.sender,
            receiverNumber: transaction.receiver,
            fee: transaction.fee,
            amount: transaction.amount + Number(calculation.deductFee),
            reference: transaction.reference,
            transactionId: transaction._id.toHexString(),
        });
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        yield transaction_model_1.Transaction.findByIdAndUpdate(req.body.transactionId, {
            status: transaction_interface_1.ITransactionStatus.FAILED,
            metaData: { message: error.message },
        });
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.CASH_OUT,
                targetWallet: transaction
                    ? transaction.toWallet
                    : undefined,
                actor: userId,
                actorWallet: userWallet._id,
                status: auditLogs_interface_1.IAuditStatus.FAILED,
                metadata: {
                    amount: transaction ? transaction.amount : undefined,
                    message: error.message,
                },
            },
        });
        eventBus_1.eventBus.emit("sendSms", {
            message: error.message,
            senderNumber: transaction === null || transaction === void 0 ? void 0 : transaction.sender,
            receiverNumber: transaction === null || transaction === void 0 ? void 0 : transaction.receiver,
            timeStamp: new Date(),
        });
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
const P2P = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, mongoose_1.startSession)();
    session.startTransaction();
    let transaction;
    const fromWallet = req.user.wallet;
    const userId = req.user.userId;
    try {
        transaction = yield (0, validateTransactionBeforeProcess_1.validateTransactionBeforeProcess)(req, session, transaction_interface_1.ITransactionType.P2P_TRANSFER);
        const calculation = (0, calculatePercent_1.calculatePercent)({
            amount: transaction.amount,
            type: "P2P",
        });
        const costAmount = transaction.amount + calculation.deductFee;
        if (fromWallet.balance < costAmount) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "Insufficient balance!");
        }
        //update transaction status
        transaction = yield (0, updateTransactionStatus_1.updateTransactionStatus)(transaction, calculation.deductFee, session);
        // update from user wallet
        yield (0, updateTransactionBalance_1.updateTransactionBalance)({
            walletId: transaction.fromWallet,
            balance: transaction.amount + calculation.deductFee,
            incType: updateTransactionBalance_1.IncType.decrement,
            session: session,
        });
        // update to user wallet
        yield (0, updateTransactionBalance_1.updateTransactionBalance)({
            walletId: transaction.toWallet,
            balance: transaction.amount,
            incType: updateTransactionBalance_1.IncType.increment,
            session: session,
        });
        // increment system wallet revenue
        const systemWallet = yield (0, updateSystemWallet_1.updateSystemWallet)({
            revenue: calculation.systemRevenue,
            session,
        });
        //create system commission
        if (systemWallet) {
            eventBus_1.eventBus.emit("commission", {
                commission: calculation.systemRevenue,
                user: systemWallet.user,
                transaction: transaction._id,
            });
        }
        yield session.commitTransaction();
        // create action log
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.P2P_TRANSFER,
                targetWallet: transaction.toWallet,
                actor: userId,
                actorWallet: transaction.fromWallet,
                status: auditLogs_interface_1.IAuditStatus.SUCCESS,
                metadata: {
                    amount: transaction.amount,
                    transactionId: transaction._id,
                },
            },
        });
        eventBus_1.eventBus.emit("sendSms", {
            timeStamp: new Date(),
            message: "Send money Success",
            senderNumber: transaction.sender,
            receiverNumber: transaction.receiver,
            fee: transaction.fee,
            amount: transaction.amount + Number(calculation.deductFee),
            reference: transaction.reference,
            transactionId: transaction._id.toHexString(),
        });
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        yield transaction_model_1.Transaction.findByIdAndUpdate(req.body.transactionId, {
            status: transaction_interface_1.ITransactionStatus.FAILED,
            metaData: { message: error.message },
        });
        eventBus_1.eventBus.emit("log", {
            req,
            payload: {
                action: auditLogs_interface_1.IAuditActionType.P2P_TRANSFER,
                targetWallet: transaction
                    ? transaction.toWallet
                    : undefined,
                actor: userId,
                actorWallet: fromWallet._id,
                status: auditLogs_interface_1.IAuditStatus.FAILED,
                metadata: {
                    amount: transaction ? transaction.amount : undefined,
                    message: error.message,
                },
            },
        });
        eventBus_1.eventBus.emit("sendSms", {
            message: error.message,
            senderNumber: transaction === null || transaction === void 0 ? void 0 : transaction.sender,
            receiverNumber: transaction === null || transaction === void 0 ? void 0 : transaction.receiver,
            timeStamp: new Date(),
        });
        throw error;
    }
    finally {
        yield session.endSession();
    }
});
exports.walletService = {
    createWallet,
    myWallet,
    getAllWallets,
    getSingleWallet,
    againstWalletAction,
    deposit,
    withdraw,
    P2P,
};
