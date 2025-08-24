"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserWithWallet = void 0;
const AppError_1 = require("../errorHelpers/AppError");
const https_status_codes_1 = require("./https-status-codes");
const checkUserWithWallet = (user, wallet) => {
    if (user.isDeleted || user.isSuspended) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_ACCEPTABLE, `Acton Failed: user is ${(user.isDeleted && "Deleted") ||
            (user.isSuspended && "Suspended")
        // (!user.isVerified && "unVerified")
        }`);
    }
    if (wallet && wallet.isBlock) {
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.NOT_ACCEPTABLE, "Action failed: The wallet is currently blocked. Please contact support for assistance.");
    }
};
exports.checkUserWithWallet = checkUserWithWallet;
