import mongoose, { Types } from "mongoose";
import { Commission } from "./commission.model";

//admin route
const getAllCommissions = async () => {
  const commissions = await Commission.find({});
  return commissions;
};
const getCommissions = async (userId: Types.ObjectId) => {
  const commissions = await Commission.find({ user: userId });
  return commissions;
};

const getSingleCommission = async (
  userId: Types.ObjectId,
  commissionId: string
) => {
  const commission = await Commission.findOne({
    id: new mongoose.Types.ObjectId(commissionId),
    user: userId,
  });
  return commission;
};

export const commissionService = {
  getAllCommissions,
  getCommissions,
  getSingleCommission,
};
