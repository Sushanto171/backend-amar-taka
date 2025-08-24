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
exports.statsService = void 0;
const user_model_1 = require("../user/user.model");
const today = new Date();
const sevenDaysAgo = new Date(today).setDate(today.getDate() - 7);
const thirtyDaysAgo = new Date(today).setDate(today.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUserPromise = user_model_1.User.countDocuments();
    const totalVerifiedPromise = (yield user_model_1.User.find({ isVerified: true })).length;
    const roleByUserPromise = user_model_1.User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);
    const newUserInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newUserInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const [total, totalVerified, roleByUser, newUserInLast7Days, newUserInLast30Days,] = yield Promise.all([
        totalUserPromise,
        totalVerifiedPromise,
        roleByUserPromise,
        newUserInLast7DaysPromise,
        newUserInLast30DaysPromise,
    ]);
    return {
        total,
        totalVerified,
        roleByUser,
        newUserInLast7Days,
        newUserInLast30Days,
    };
});
const getTransactionStats = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getCommissionStats = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getWalletStats = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
const getLogStats = () => __awaiter(void 0, void 0, void 0, function* () {
    return {};
});
exports.statsService = {
    getUserStats,
    getTransactionStats,
    getCommissionStats,
    getWalletStats,
    getLogStats,
};
