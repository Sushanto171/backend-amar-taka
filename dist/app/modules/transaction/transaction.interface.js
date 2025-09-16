"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITransactionStatus = exports.ITransactionType = void 0;
var ITransactionType;
(function (ITransactionType) {
    ITransactionType["CASH_IN"] = "CASH_IN";
    ITransactionType["CASH_OUT"] = "CASH_OUT";
    ITransactionType["P2P_TRANSFER"] = "SEND_MONEY";
    ITransactionType["MERCHANT_PAYMENT"] = "MERCHANT_PAYMENT";
    ITransactionType["BILL_PAYMENT"] = "BILL_PAYMENT";
    ITransactionType["Bonus"] = "BONUS";
})(ITransactionType || (exports.ITransactionType = ITransactionType = {}));
var ITransactionStatus;
(function (ITransactionStatus) {
    ITransactionStatus["PENDING"] = "PENDING";
    ITransactionStatus["PROCESSING"] = "PROCESSING";
    ITransactionStatus["SUCCESS"] = "SUCCESS";
    ITransactionStatus["FAILED"] = "FAILED";
    ITransactionStatus["CANCELLED"] = "CANCELLED";
    ITransactionStatus["REVERSED"] = "REVERSED";
    ITransactionStatus["EXPIRED"] = "EXPIRED";
    ITransactionStatus["ON_HOLD"] = "ON_HOLD";
    ITransactionStatus["VERIFIED"] = "VERIFIED";
    ITransactionStatus["REJECTED"] = "REJECTED";
})(ITransactionStatus || (exports.ITransactionStatus = ITransactionStatus = {}));
