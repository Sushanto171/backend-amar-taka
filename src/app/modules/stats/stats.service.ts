import { Agent } from "../agent/agent.model";
import { User } from "../user/user.model";

const today = new Date();
const sevenDaysAgo = new Date(today).setDate(today.getDate() - 7);
const thirtyDaysAgo = new Date(today).setDate(today.getDate() - 30);

const getUserStats = async () => {
  const totalUserPromise = User.countDocuments({role:"USER"});
  const totalVerifiedPromise = (await User.find({ isVerified: true })).length;

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
  const newUserInLast7DaysPromise = User.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });
  const newUserInLast30DaysPromise = User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const [
    total,
    totalVerified,

    newUserInLast7Days,
    newUserInLast30Days,
    amount,
  ] = await Promise.all([
    totalUserPromise,
    totalVerifiedPromise,

    newUserInLast7DaysPromise,
    newUserInLast30DaysPromise,
    amountPromise,
  ]);
  return {
    total,
    totalVerified,

    newUserInLast7Days,
    newUserInLast30Days,
    amount,
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
  const [totalAgent, KYCStatus, amount] = await Promise.all([
    totalAgentPromise,
    KYCStatusPromise,
    amountPromise,
  ]);
  return {
    totalAgent,
    KYCStatus,
    amount,
  };
};
const getTransactionStats = async () => {
  return {};
};
const getCommissionStats = async () => {
  return {};
};
const getWalletStats = async () => {
  return {};
};
const getLogStats = async () => {
  return {};
};

export const statsService = {
  getUserStats,
  getAgentStats,
  getTransactionStats,
  getCommissionStats,
  getWalletStats,
  getLogStats,
};
