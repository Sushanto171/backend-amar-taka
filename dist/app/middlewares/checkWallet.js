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
exports.checkWallet = void 0;
const AppError_1 = require("../errorHelpers/AppError");
const auditLogs_interface_1 = require("../modules/auditLogs/auditLogs.interface");
const eventBus_1 = require("../modules/event/eventBus");
const transaction_interface_1 = require("../modules/transaction/transaction.interface");
const transaction_model_1 = require("../modules/transaction/transaction.model");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const bcryptjs_1 = require("../utils/bcryptjs");
const checkAgentKycStatus_1 = require("../utils/checkAgentKycStatus");
const checkUserWithWallet_1 = require("../utils/checkUserWithWallet");
const https_status_codes_1 = require("../utils/https-status-codes");
const checkWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const plainPassword = req.body.password;
        const isUserExist = yield user_model_1.User.findById(userId)
            .select("+password")
            .populate(["agent", "wallet"]);
        if (!isUserExist) {
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found!");
        }
        (0, checkUserWithWallet_1.checkUserWithWallet)(isUserExist, isUserExist.wallet);
        if (isUserExist.role === user_interface_1.IRole.AGENT) {
            (0, checkAgentKycStatus_1.checkAgentKycStatus)(isUserExist.agent);
        }
        const matchedPassword = yield (0, bcryptjs_1.comparePassword)(isUserExist.password, plainPassword);
        if (!matchedPassword) {
            const transactionDoc = yield transaction_model_1.Transaction.findByIdAndUpdate(req.body.transactionId, {
                status: transaction_interface_1.ITransactionStatus.FAILED,
                metaData: { message: "Invalid password" },
            }, { new: true, runValidators: true });
            const transaction = transactionDoc === null || transactionDoc === void 0 ? void 0 : transactionDoc.toObject();
            eventBus_1.eventBus.emit("log", {
                req,
                payload: {
                    action: transaction === null || transaction === void 0 ? void 0 : transaction.type,
                    targetWallet: transaction === null || transaction === void 0 ? void 0 : transaction.toWallet,
                    actor: userId,
                    actorWallet: transaction === null || transaction === void 0 ? void 0 : transaction.fromWallet,
                    status: auditLogs_interface_1.IAuditStatus.FAILED,
                    metadata: {
                        amount: transaction === null || transaction === void 0 ? void 0 : transaction.amount,
                        message: "Invalid Password",
                    },
                },
            });
            throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, "Invalid password!");
        }
        req.user = {
            userId: isUserExist._id,
            role: isUserExist.role,
            phone: isUserExist.phone,
            wallet: isUserExist.wallet, //wallet object
        };
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkWallet = checkWallet;
