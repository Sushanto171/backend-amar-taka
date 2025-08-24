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
exports.seedAdmin = void 0;
/* eslint-disable no-console */
const mongoose_1 = require("mongoose");
const env_config_1 = require("../config/env.config");
const AppError_1 = require("../errorHelpers/AppError");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const wallet_interface_1 = require("../modules/wallet/wallet.interface");
const wallet_model_1 = require("../modules/wallet/wallet.model");
const bcryptjs_1 = require("./bcryptjs");
const https_status_codes_1 = require("./https-status-codes");
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield (0, mongoose_1.startSession)();
        session.startTransaction();
        const isAdminExist = yield user_model_1.User.findOne({
            phone: env_config_1.envVars.ADMIN.ADMIN_PHONE,
        });
        if (isAdminExist) {
            console.log("Welcome ❤️‍🔥.. Admin already exist.");
            session.endSession();
            return;
        }
        const hashedPassword = yield (0, bcryptjs_1.hashPassword)(env_config_1.envVars.ADMIN.ADMIN_PASSWORD, env_config_1.envVars.BCRYPT_SALT_ROUND);
        const adminPayload = {
            name: env_config_1.envVars.ADMIN.ADMIN_NAME,
            phone: env_config_1.envVars.ADMIN.ADMIN_PHONE,
            email: env_config_1.envVars.ADMIN.ADMIN_EMAIL,
            isVerified: true,
            password: hashedPassword,
            role: user_interface_1.IRole.ADMIN,
        };
        const adminArray = yield user_model_1.User.create([adminPayload], { session });
        const admin = adminArray[0].toObject();
        const walletPayload = {
            user: admin._id,
            balance: env_config_1.envVars.ADMIN.ADMIN_INITIAL_SYSTEM_FUND,
            type: wallet_interface_1.IWalletType.SYSTEM,
            revenue: 0,
        };
        const walletArray = yield wallet_model_1.Wallet.create([walletPayload], { session });
        yield user_model_1.User.findByIdAndUpdate(admin._id, { wallet: walletArray[0]._id }, { session });
        yield session.commitTransaction();
        yield session.endSession();
    }
    catch (error) {
        console.log("Admin creation Error:", error);
        throw new AppError_1.AppError(https_status_codes_1.httpsStatusCodes.INTERNAL_SERVER_ERROR, "Admin creation error");
    }
});
exports.seedAdmin = seedAdmin;
