import { User } from "../user/user.model";

const today = new Date();
const sevenDaysAgo = new Date(today).setDate(today.getDate() - 7);
const thirtyDaysAgo = new Date(today).setDate(today.getDate() - 30);

const getUserStats = async () => {
  const totalUserPromise = User.countDocuments();
  const totalVerifiedPromise = (await User.find({ isVerified: true })).length;
  const roleByUserPromise = User.aggregate([
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
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
    roleByUser,
    newUserInLast7Days,
    newUserInLast30Days,
  ] = await Promise.all([
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
  getTransactionStats,
  getCommissionStats,
  getWalletStats,
  getLogStats,
};
