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
const agent_model_1 = require("../agent/agent.model");
const transaction_model_1 = require("../transaction/transaction.model");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const today = new Date();
const oneDaysAgo = new Date(today).setDate(today.getDate() - 1);
const towDaysAgo = new Date(today).setDate(today.getDate() - 2);
const threeDaysAgo = new Date(today).setDate(today.getDate() - 3);
const sevenDaysAgo = new Date(today).setDate(today.getDate() - 7);
const thirtyDaysAgo = new Date(today).setDate(today.getDate() - 30);
const getUserStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalUserPromise = user_model_1.User.countDocuments();
    const totalVerifiedPromise = (yield user_model_1.User.find({ isVerified: true })).length;
    const roleByUsersPromise = user_model_1.User.aggregate([
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 },
            },
        },
    ]);
    const amountPromise = user_model_1.User.aggregate([
        {
            $match: { role: "USER" },
        },
        {
            $lookup: {
                from: "wallets",
                foreignField: "_id",
                localField: "wallet",
                as: "account",
            },
        },
        {
            $unwind: "$account",
        },
        {
            $project: { "account.balance": 1 },
        },
        {
            $group: {
                _id: "userWallets",
                totalBalance: { $sum: "$account.balance" },
            },
        },
    ]);
    const newUserInLast1DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: oneDaysAgo },
    });
    const newUserInLast2DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: towDaysAgo },
    });
    const newUserInLast3DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: threeDaysAgo },
    });
    const newUserInLast7DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newUserInLast30DaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const [total, totalVerified, roleByUsers, newUserInLast7Days, newUserInLast30Days, amount, newUserInLast1Days, newUserInLast2Days, newUserInLast3Days,] = yield Promise.all([
        totalUserPromise,
        totalVerifiedPromise,
        roleByUsersPromise,
        newUserInLast7DaysPromise,
        newUserInLast30DaysPromise,
        amountPromise,
        newUserInLast1DaysPromise,
        newUserInLast2DaysPromise,
        newUserInLast3DaysPromise,
    ]);
    return {
        total,
        totalVerified,
        roleByUsers,
        newUserInLast7Days,
        newUserInLast30Days,
        newUserInLast1Days,
        newUserInLast2Days,
        newUserInLast3Days,
        amount: amount[0].totalBalance,
    };
});
const getAgentStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalAgentPromise = agent_model_1.Agent.countDocuments();
    const KYCStatusPromise = agent_model_1.Agent.aggregate([
        {
            $group: {
                _id: "$kycStatus",
                count: { $sum: 1 },
            },
        },
    ]);
    const amountPromise = agent_model_1.Agent.aggregate([
        {
            $lookup: {
                from: "wallets",
                localField: "wallet",
                foreignField: "_id",
                as: "wallets",
            },
        },
        { $unwind: "$wallets" },
        { $project: { "wallets.balance": 1, "wallets.revenue": 1 } },
        {
            $group: {
                _id: "agentWallets",
                totalBalance: { $sum: "$wallets.balance" },
                totalRevenue: { $sum: "$wallets.revenue" },
            },
        },
    ]);
    const newAgentInLast1DaysPromise = agent_model_1.Agent.countDocuments({
        createdAt: { $gte: oneDaysAgo },
    });
    const newAgentInLast2DaysPromise = agent_model_1.Agent.countDocuments({
        createdAt: { $gte: towDaysAgo },
    });
    const newAgentInLast3DaysPromise = agent_model_1.Agent.countDocuments({
        createdAt: { $gte: threeDaysAgo },
    });
    const newAgentInLast7DaysPromise = agent_model_1.Agent.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newAgentInLast30DaysPromise = agent_model_1.Agent.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const [totalAgent, KYCStatus, amount, newAgentInLast7Days, newAgentInLast30Days, newAgentInLast1Days, newAgentInLast2Days, newAgentInLast3Days,] = yield Promise.all([
        totalAgentPromise,
        KYCStatusPromise,
        amountPromise,
        newAgentInLast7DaysPromise,
        newAgentInLast30DaysPromise,
        newAgentInLast1DaysPromise,
        newAgentInLast2DaysPromise,
        newAgentInLast3DaysPromise,
    ]);
    return {
        totalAgent,
        KYCStatus,
        amount: amount[0].totalBalance,
        revenue: amount[0].totalRevenue,
        newAgentInLast7Days,
        newAgentInLast30Days,
        newAgentInLast1Days,
        newAgentInLast2Days,
        newAgentInLast3Days,
    };
});
const getTransactionStats = () => __awaiter(void 0, void 0, void 0, function* () {
    const totalTransactionPromise = transaction_model_1.Transaction.countDocuments();
    const newTransactionInLast7DaysPromise = transaction_model_1.Transaction.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
    });
    const newTransactionInLast30DaysPromise = transaction_model_1.Transaction.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
    });
    const typeByTransactionPromise = transaction_model_1.Transaction.aggregate([
        {
            $group: {
                _id: "$type",
                count: { $sum: 1 },
                amount: { $sum: "$amount" },
            },
        },
    ]);
    const statusByTransactionPromise = transaction_model_1.Transaction.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
    ]);
    const totalTransactionAmountPromise = transaction_model_1.Transaction.aggregate([
        { $match: { status: "SUCCESS" } },
        {
            $group: {
                _id: "",
                totalAmount: { $sum: "$amount" },
            },
        },
    ]);
    const last7DaysTransactionsPromise = transaction_model_1.Transaction.find({ createdAt: { $gte: sevenDaysAgo } }, { amount: 1, type: 1, status: 1, _id: 0, createdAt: 1 });
    const [totalTransaction, newTransactionInLast7Days, newTransactionInLast30Days, typeByTransaction, statusByTransaction, last7DaysTransactions, totalTransactionAmount,] = yield Promise.all([
        totalTransactionPromise,
        newTransactionInLast7DaysPromise,
        newTransactionInLast30DaysPromise,
        typeByTransactionPromise,
        statusByTransactionPromise,
        last7DaysTransactionsPromise,
        totalTransactionAmountPromise,
    ]);
    return {
        totalTransaction,
        newTransactionInLast7Days,
        newTransactionInLast30Days,
        typeByTransaction,
        statusByTransaction,
        last7DaysTransactions,
        totalAmount: totalTransactionAmount[0].totalAmount,
    };
});
const getSystemStats = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = yield wallet_model_1.Wallet.findById(walletId, { balance: 1, revenue: 1 });
    return { amount: amount === null || amount === void 0 ? void 0 : amount.balance, revenue: amount === null || amount === void 0 ? void 0 : amount.revenue };
});
exports.statsService = {
    getUserStats,
    getAgentStats,
    getTransactionStats,
    getSystemStats,
};
