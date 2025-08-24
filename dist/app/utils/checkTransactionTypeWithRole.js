"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSameNumber = exports.checkTransactionTypeWithRole = void 0;
const AppError_1 = require("../errorHelpers/AppError");
const transaction_interface_1 = require("../modules/transaction/transaction.interface");
const user_interface_1 = require("../modules/user/user.interface");
const https_status_codes_1 = require("./https-status-codes");
const checkTransactionTypeWithRole = (userRole, payload) => {
    if ((userRole === user_interface_1.IRole.AGENT && payload.type !== transaction_interface_1.ITransactionType.CASH_IN) ||
        (userRole === user_interface_1.IRole.USER && payload.type === transaction_interface_1.ITransactionType.CASH_IN)) {
        console.log(userRole, payload.type);
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_ACCEPTABLE, "Your are not permitted for this action!");
    }
};
exports.checkTransactionTypeWithRole = checkTransactionTypeWithRole;
const checkSameNumber = (req) => {
    var _a, _b;
    if (((_a = req.body) === null || _a === void 0 ? void 0 : _a.phone) === ((_b = req.user) === null || _b === void 0 ? void 0 : _b.phone)) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_ACCEPTABLE, "Your can't transaction with some number!");
    }
};
exports.checkSameNumber = checkSameNumber;
