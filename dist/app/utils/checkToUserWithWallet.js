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
exports.checkToUserWithWallet = void 0;
const AppError_1 = require("../errorHelpers/AppError");
const transaction_interface_1 = require("../modules/transaction/transaction.interface");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const checkAgentKycStatus_1 = require("./checkAgentKycStatus");
const checkUserWithWallet_1 = require("./checkUserWithWallet");
const https_status_codes_1 = require("./https-status-codes");
const checkToUserWithWallet = (payload, session) => __awaiter(void 0, void 0, void 0, function* () {
    const phone = payload.phone;
    let checkToUserRole;
    const isToUserExist = yield user_model_1.User.findOne({ phone })
        .populate(["wallet", "agent"])
        .session(session);
    if (!isToUserExist) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_FOUND, "User does not found!");
    }
    // transaction type = cash in => to user.role = user || cash out => agent || p2p  => user
    if (payload.type === transaction_interface_1.ITransactionType.CASH_IN)
        checkToUserRole = user_interface_1.IRole.USER;
    else if (payload.type === transaction_interface_1.ITransactionType.CASH_OUT)
        checkToUserRole = user_interface_1.IRole.AGENT;
    else
        checkToUserRole = user_interface_1.IRole.USER;
    if (!checkToUserRole.includes(isToUserExist.role)) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.BAD_REQUEST, `This user is not ${checkToUserRole}`);
    }
    if (isToUserExist && isToUserExist.wallet) {
        (0, checkUserWithWallet_1.checkUserWithWallet)(isToUserExist, isToUserExist.wallet);
    }
    if (isToUserExist.agent) {
        (0, checkAgentKycStatus_1.checkAgentKycStatus)(isToUserExist.agent);
    }
    const toUserInfo = {
        user: isToUserExist,
        wallet: isToUserExist.wallet && isToUserExist.wallet._id,
        agent: isToUserExist.agent && isToUserExist.agent._id,
    };
    return toUserInfo;
});
exports.checkToUserWithWallet = checkToUserWithWallet;
