import { Agent } from "../agent/agent.model";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.model";

const today = new Date();
const oneDaysAgo = new Date(today).setDate(today.getDate() - 1);
const towDaysAgo = new Date(today).setDate(today.getDate() - 2);
const threeDaysAgo = new Date(today).setDate(today.getDate() - 3);
const sevenDaysAgo = new Date(today).setDate(today.getDate() - 7);
const thirtyDaysAgo = new Date(today).setDate(today.getDate() - 30);

const getUserStats = async () => {
  const totalUserPromise = User.countDocuments();
  const totalVerifiedPromise = (await User.find({ isVerified: true })).length;
  const roleByUsersPromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  const amountPromise = User.aggregate([
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
  const newUserInLast1DaysPromise = User.countDocuments({
    createdAt: { $gte: oneDaysAgo },
  });
  const newUserInLast2DaysPromise = User.countDocuments({
    createdAt: { $gte: towDaysAgo },
  });
  const newUserInLast3DaysPromise = User.countDocuments({
    createdAt: { $gte: threeDaysAgo },
  });
  const newUserInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUserInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const [
    total,
    totalVerified,
    roleByUsers,
    newUserInLast7Days,
    newUserInLast30Days,
    amount,
    newUserInLast1Days,
    newUserInLast2Days,
    newUserInLast3Days,
  ] = await Promise.all([
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
};

const getAgentStats = async () => {
  const totalAgentPromise = Agent.countDocuments();
  const KYCStatusPromise = Agent.aggregate([
    {
      $group: {
        _id: "$kycStatus",
        count: { $sum: 1 },
      },
    },
  ]);
  const amountPromise = Agent.aggregate([
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
  const newAgentInLast1DaysPromise = Agent.countDocuments({
    createdAt: { $gte: oneDaysAgo },
  });
  const newAgentInLast2DaysPromise = Agent.countDocuments({
    createdAt: { $gte: towDaysAgo },
  });
  const newAgentInLast3DaysPromise = Agent.countDocuments({
    createdAt: { $gte: threeDaysAgo },
  });

  const newAgentInLast7DaysPromise = Agent.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newAgentInLast30DaysPromise = Agent.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });
  const [
    totalAgent,
    KYCStatus,
    amount,
    newAgentInLast7Days,
    newAgentInLast30Days,
    newAgentInLast1Days,
    newAgentInLast2Days,
    newAgentInLast3Days,
  ] = await Promise.all([
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
};
const getTransactionStats = async () => {
  const totalTransactionPromise = Transaction.countDocuments();
  const newTransactionInLast7DaysPromise = Transaction.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newTransactionInLast30DaysPromise = Transaction.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const typeByTransactionPromise = Transaction.aggregate([
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
  ]);
  const statusByTransactionPromise = Transaction.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  const totalTransactionAmountPromise = Transaction.aggregate([
    { $match: { status: "SUCCESS" } },
    {
      $group: {
        _id: "",
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  const last7DaysTransactionsPromise = Transaction.find(
    { createdAt: { $gte: sevenDaysAgo } },
    { amount: 1, type: 1, status: 1, _id: 0, createdAt: 1 }
  );
  const [
    totalTransaction,
    newTransactionInLast7Days,
    newTransactionInLast30Days,
    typeByTransaction,
    statusByTransaction,
    last7DaysTransactions,
    totalTransactionAmount,
  ] = await Promise.all([
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
};
const getSystemStats = async (walletId: string) => {
  const amount = await Wallet.findById(walletId, { balance: 1, revenue: 1 });
  return { amount: amount?.balance, revenue: amount?.revenue };
};

export const statsService = {
  getUserStats,
  getAgentStats,
  getTransactionStats,
  getSystemStats,
};
