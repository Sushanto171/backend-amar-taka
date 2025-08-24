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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTransactionBeforeProcess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../errorHelpers/AppError");
const transaction_interface_1 = require("../modules/transaction/transaction.interface");
const transaction_model_1 = require("../modules/transaction/transaction.model");
const https_status_codes_1 = require("./https-status-codes");
const validateTransactionBeforeProcess = (req, session, type) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId } = req.body;
    const walletId = req.user.wallet._id;
    const transaction = yield transaction_model_1.Transaction.findOne({
        _id: new mongoose_1.default.Types.ObjectId(transactionId),
        type,
    }).session(session);
    if (!transaction) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "Transaction does not found.");
    }
    if (!transaction.fromWallet.equals(walletId)) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.UNAUTHORIZED, "Unauthorized access!");
    }
    if (transaction.status === transaction_interface_1.ITransactionStatus.SUCCESS) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "This transaction has already been processed.");
    }
    return transaction;
});
exports.validateTransactionBeforeProcess = validateTransactionBeforeProcess;
